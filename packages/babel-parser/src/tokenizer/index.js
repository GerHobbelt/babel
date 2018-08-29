// @flow

import type { Options } from "../options";
import type { Position } from "../util/location";
import * as charCodes from "charcodes";
import {
  isIdentifierStart,
  isIdentifierChar,
  isKeyword,
} from "../util/identifier";
import { types as tt, keywords as keywordTypes, type TokenType } from "./types";
import { type TokContext, types as ct } from "./context";
import LocationParser from "../parser/location";
import { SourceLocation } from "../util/location";
import {
  lineBreak,
  lineBreakG,
  isNewLine,
  isWhitespace,
} from "../util/whitespace";
import State from "./state";

const VALID_REGEX_FLAGS = "gmsiyu";

// The following character codes are forbidden from being
// an immediate sibling of NumericLiteralSeparator _

const forbiddenNumericSeparatorSiblings = {
  decBinOct: [
    charCodes.dot,
    charCodes.uppercaseB,
    charCodes.uppercaseE,
    charCodes.uppercaseO,
    charCodes.underscore, // multiple separators are not allowed
    charCodes.lowercaseB,
    charCodes.lowercaseE,
    charCodes.lowercaseO,
  ],
  hex: [
    charCodes.dot,
    charCodes.uppercaseX,
    charCodes.underscore, // multiple separators are not allowed
    charCodes.lowercaseX,
  ],
};

const allowedNumericSeparatorSiblings = {};
allowedNumericSeparatorSiblings.bin = [
  // 0 - 1
  charCodes.digit0,
  charCodes.digit1,
];
allowedNumericSeparatorSiblings.oct = [
  // 0 - 7
  ...allowedNumericSeparatorSiblings.bin,

  charCodes.digit2,
  charCodes.digit3,
  charCodes.digit4,
  charCodes.digit5,
  charCodes.digit6,
  charCodes.digit7,
];
allowedNumericSeparatorSiblings.dec = [
  // 0 - 9
  ...allowedNumericSeparatorSiblings.oct,

  charCodes.digit8,
  charCodes.digit9,
];

allowedNumericSeparatorSiblings.hex = [
  // 0 - 9, A - F, a - f,
  ...allowedNumericSeparatorSiblings.dec,

  charCodes.uppercaseA,
  charCodes.uppercaseB,
  charCodes.uppercaseC,
  charCodes.uppercaseD,
  charCodes.uppercaseE,
  charCodes.uppercaseF,

  charCodes.lowercaseA,
  charCodes.lowercaseB,
  charCodes.lowercaseC,
  charCodes.lowercaseD,
  charCodes.lowercaseE,
  charCodes.lowercaseF,
];

// Object type used to represent tokens. Note that normally, tokens
// simply exist as properties on the parser object. This is only
// used for the onToken callback and the external tokenizer.

export class Token {
  constructor(state: State) {
    this.type = state.type;
    this.value = state.value;
    this.start = state.start;
    this.end = state.end;
    this.loc = new SourceLocation(state.startLoc, state.endLoc);
  }

  type: TokenType;
  value: any;
  start: number;
  end: number;
  loc: SourceLocation;
}

// ## Tokenizer

export default class Tokenizer extends LocationParser {
  // Forward-declarations
  // parser/util.js
  +unexpected: (pos?: ?number, messageOrType?: string | TokenType) => empty;

  isLookahead: boolean;

  constructor(options: Options, input: string) {
    super();
    this.state = new State();
    this.state.init(options, input);
    this.isLookahead = false;
  }

  // Move to the next token

  next(): void {
    if (this.options.tokens && !this.isLookahead) {
      this.state.tokens.push(new Token(this.state));
    }

    this.state.lastTokEnd = this.state.end;
    this.state.lastTokStart = this.state.start;
    this.state.lastTokEndLoc = this.state.endLoc;
    this.state.lastTokStartLoc = this.state.startLoc;
    this.nextToken();
  }

  // TODO

  eat(type: TokenType): boolean {
    if (this.match(type)) {
      this.next();
      return true;
    } else {
      return false;
    }
  }

  // TODO

  match(type: TokenType): boolean {
    return this.state.type === type;
  }

  // TODO

  isKeyword(word: string): boolean {
    return isKeyword(word);
  }

  // TODO

  lookahead(): State {
    const old = this.state;
    this.state = old.clone(true);

    this.isLookahead = true;
    this.next();
    this.isLookahead = false;

    const curr = this.state;
    this.state = old;
    return curr;
  }

  // Toggle strict mode. Re-reads the next number or string to please
  // pedantic tests (`"use strict"; 010;` should fail).

  setStrict(strict: boolean): void {
    this.state.strict = strict;
    if (!this.match(tt.num) && !this.match(tt.string)) return;
    this.state.pos = this.state.start;
    while (this.state.pos < this.state.lineStart) {
      this.state.lineStart =
        this.input.lastIndexOf("\n", this.state.lineStart - 2) + 1;
      --this.state.curLine;
    }
    this.nextToken();
  }

  curContext(): TokContext {
    return this.state.context[this.state.context.length - 1];
  }

  // Read a single token, updating the parser object's token-related
  // properties.

  nextToken(): void {
    const curContext = this.curContext();
    if (!curContext || !curContext.preserveSpace) this.skipSpace();

    this.state.containsOctal = false;
    this.state.octalPosition = null;
    this.state.start = this.state.pos;
    this.state.startLoc = this.state.curPosition();
    if (this.state.pos >= this.input.length) {
      this.finishToken(tt.eof);
      return;
    }

    if (curContext.override) {
      curContext.override(this);
    } else {
      this.readToken(this.input.codePointAt(this.state.pos));
    }
  }

  readToken(code: number): void {
    // JISON variables can also start with '$' which itself is a legal
    // IndentifierStartChracter for JS, hence we should *first* check
    // if we have a JISON variable right here:
    if (
      this.options.jisonVariables &&
      !this.state.isIterator &&
      !this.state.inType &&
      (code === charCodes.numberSign ||
        code === charCodes.atSign ||
        code === charCodes.dollarSign)
    ) {
      // JISON variables have a lead (and possibly a tail as well) consisting of any of these: # @ $
      // while the variable MAY be a *negative* index, e.g. `$-1`, hence we tolerate a single `-`
      // minus character following the lead characters of the JISON variable:
      const type = tt.name;

      // consume head/lead of jison variable: readWord1()...
      // ...accept only series of @@..., ##... and $$..., but no mixes
      // such as #@ or #$ -- note the latter should be decoded as head '#' +
      // identifier core '$' instead.
      const chunkStart = this.state.pos;
      for (;;) {
        const ch = this.fullCharCodeAtPos();
        if (ch === code) {
          this.state.pos++;
        } else {
          break;
        }
      }

      // accept a `-` minus sign when it follows this lead immediately and
      // is followed immediately by a number, e.g. `$-1`
      const code1 = this.input.charCodeAt(this.state.pos);
      if (code1 === charCodes.dash) {
        const code2 = this.input.charCodeAt(this.state.pos + 1);
        if (code2 >= 0x30 && code2 <= 0x39) {
          this.state.pos++; // consume the '-' dash
        }
      }

      const identifierStart = this.state.pos;

      this.readWord1(); // side-effect: moves `this.state.pos` past the identifier

      // Jison variables must have a non-empty identifier part, either numeric or alphanumeric,
      // UNLESS the head ends with a '$' dollar:
      if (
        this.state.pos === identifierStart &&
        code /* optimization -- this.input.charCodeAt(this.state.pos - 1) */ !==
          charCodes.dollarSign
      ) {
        this.raise(
          chunkStart,
          `Invalid JISON identifier ${this.input.slice(
            chunkStart,
            this.state.pos,
          )}`,
        );
      }

      // consume tail of jison identifier: readWord1()...
      // ...again we only accept more of the same, i.e. #id#,
      // @id@, $id$, but not mixes such as @id#:
      for (;;) {
        const ch = this.fullCharCodeAtPos();
        if (ch === code) {
          this.state.pos++;
        } else {
          break;
        }
      }

      const word = this.input.slice(chunkStart, this.state.pos);

      this.finishToken(type, word);
    } else if (
      isIdentifierStart(code) ||
      code === charCodes.backslash
      // Identifier or keyword. '\uXXXX' sequences are allowed in
      // identifiers, so '\' also dispatches to that.
    ) {
      this.readWord();
    } else {
      this.getTokenFromCode(code);
    }
  }

  pushComment(
    block: boolean,
    text: string,
    start: number,
    end: number,
    startLoc: Position,
    endLoc: Position,
  ): void {
    const comment = {
      type: block ? "CommentBlock" : "CommentLine",
      value: text,
      start: start,
      end: end,
      loc: new SourceLocation(startLoc, endLoc),
    };

    if (!this.isLookahead) {
      if (this.options.tokens) this.state.tokens.push(comment);
      this.state.comments.push(comment);
      this.addComment(comment);
    }
  }

  skipBlockComment(): void {
    const startLoc = this.state.curPosition();
    const start = this.state.pos;
    const end = this.input.indexOf("*/", (this.state.pos += 2));
    if (end === -1) this.raise(this.state.pos - 2, "Unterminated comment");

    this.state.pos = end + 2;
    lineBreakG.lastIndex = start;
    let match;
    while (
      (match = lineBreakG.exec(this.input)) &&
      match.index < this.state.pos
    ) {
      ++this.state.curLine;
      this.state.lineStart = match.index + match[0].length;
    }

    this.pushComment(
      true,
      this.input.slice(start + 2, end),
      start,
      this.state.pos,
      startLoc,
      this.state.curPosition(),
    );
  }

  skipLineComment(startSkip: number): void {
    const start = this.state.pos;
    const startLoc = this.state.curPosition();
    let ch = this.input.charCodeAt((this.state.pos += startSkip));
    if (this.state.pos < this.input.length) {
      while (
        ch !== charCodes.lineFeed &&
        ch !== charCodes.carriageReturn &&
        ch !== charCodes.lineSeparator &&
        ch !== charCodes.paragraphSeparator &&
        ++this.state.pos < this.input.length
      ) {
        ch = this.input.charCodeAt(this.state.pos);
      }
    }

    this.pushComment(
      false,
      this.input.slice(start + startSkip, this.state.pos),
      start,
      this.state.pos,
      startLoc,
      this.state.curPosition(),
    );
  }

  // Called at the start of the parse and after every token. Skips
  // whitespace and comments, and.

  skipSpace(): void {
    loop: while (this.state.pos < this.input.length) {
      const ch = this.input.charCodeAt(this.state.pos);
      switch (ch) {
        case charCodes.carriageReturn:
          if (
            this.input.charCodeAt(this.state.pos + 1) === charCodes.lineFeed
          ) {
            ++this.state.pos;
          }

        case charCodes.lineFeed:
        case charCodes.lineSeparator:
        case charCodes.paragraphSeparator:
          ++this.state.pos;
          ++this.state.curLine;
          this.state.lineStart = this.state.pos;
          break;

        case charCodes.slash:
          switch (this.input.charCodeAt(this.state.pos + 1)) {
            case charCodes.asterisk:
              this.skipBlockComment();
              break;

            case charCodes.slash:
              this.skipLineComment(2);
              break;

            default:
              break loop;
          }
          break;

        default:
          if (isWhitespace(ch)) {
            ++this.state.pos;
          } else {
            break loop;
          }
      }
    }
  }

  // Called at the end of every token. Sets `end`, `val`, and
  // maintains `context` and `exprAllowed`, and skips the space after
  // the token, so that the next one's `start` will point at the
  // right position.

  finishToken(type: TokenType, val: any): void {
    this.state.end = this.state.pos;
    this.state.endLoc = this.state.curPosition();
    const prevType = this.state.type;
    this.state.type = type;
    this.state.value = val;

    this.updateContext(prevType);
  }

  // ### Token reading

  // This is the function that is called to fetch the next token. It
  // is somewhat obscure, because it works in character codes rather
  // than characters, and because operator parsing has been inlined
  // into it.
  //
  // All in the name of speed.
  //
  readToken_dot(): void {
    const next = this.input.charCodeAt(this.state.pos + 1);
    if (next >= charCodes.digit0 && next <= charCodes.digit9) {
      this.readNumber(true);
      return;
    }

    const next2 = this.input.charCodeAt(this.state.pos + 2);
    if (next === charCodes.dot && next2 === charCodes.dot) {
      this.state.pos += 3;
      this.finishToken(tt.ellipsis);
    } else {
      ++this.state.pos;
      this.finishToken(tt.dot);
    }
  }

  readToken_slash(): void {
    // '/'
    if (this.state.exprAllowed && !this.state.inType) {
      ++this.state.pos;
      this.readRegexp();
      return;
    }

    const next = this.input.charCodeAt(this.state.pos + 1);
    if (next === charCodes.equalsTo) {
      this.finishOp(tt.assign, 2);
    } else {
      this.finishOp(tt.slash, 1);
    }
  }

  readToken_interpreter(): boolean {
    if (this.state.pos !== 0 || this.state.input.length < 2) return false;

    const start = this.state.pos;
    this.state.pos += 1;

    let ch = this.input.charCodeAt(this.state.pos);
    if (ch !== charCodes.exclamationMark) return false;

    while (
      ch !== charCodes.lineFeed &&
      ch !== charCodes.carriageReturn &&
      ch !== charCodes.lineSeparator &&
      ch !== charCodes.paragraphSeparator &&
      ++this.state.pos < this.input.length
    ) {
      ch = this.input.charCodeAt(this.state.pos);
    }

    const value = this.input.slice(start + 2, this.state.pos);

    this.finishToken(tt.interpreterDirective, value);

    return true;
  }

  readToken_mult_modulo(code: number): void {
    // '%*'
    let type = code === charCodes.asterisk ? tt.star : tt.modulo;
    let width = 1;
    let next = this.input.charCodeAt(this.state.pos + 1);
    const exprAllowed = this.state.exprAllowed;

    // Exponentiation operator **
    if (code === charCodes.asterisk && next === charCodes.asterisk) {
      width++;
      next = this.input.charCodeAt(this.state.pos + 2);
      type = tt.exponent;
    }

    if (next === charCodes.equalsTo && !exprAllowed) {
      width++;
      type = tt.assign;
    }

    this.finishOp(type, width);
  }

  readToken_pipe_amp(code: number): void {
    // '|&'
    const next = this.input.charCodeAt(this.state.pos + 1);

    if (next === code) {
      if (this.input.charCodeAt(this.state.pos + 2) === charCodes.equalsTo) {
        this.finishOp(tt.assign, 3);
      } else {
        this.finishOp(
          code === charCodes.verticalBar ? tt.logicalOR : tt.logicalAND,
          2,
        );
      }
      return;
    }

    if (code === charCodes.verticalBar) {
      // '|>'
      if (next === charCodes.greaterThan) {
        this.finishOp(tt.pipeline, 2);
        return;
      } else if (next === charCodes.rightCurlyBrace && this.hasPlugin("flow")) {
        // '|}'
        this.finishOp(tt.braceBarR, 2);
        return;
      }
    }

    if (next === charCodes.equalsTo) {
      this.finishOp(tt.assign, 2);
      return;
    }

    this.finishOp(
      code === charCodes.verticalBar ? tt.bitwiseOR : tt.bitwiseAND,
      1,
    );
  }

  readToken_caret(): void {
    // '^'
    const next = this.input.charCodeAt(this.state.pos + 1);
    if (next === charCodes.equalsTo) {
      this.finishOp(tt.assign, 2);
    } else {
      this.finishOp(tt.bitwiseXOR, 1);
    }
  }

  readToken_plus_min(code: number): void {
    // '+-'
    const next = this.input.charCodeAt(this.state.pos + 1);

    if (next === code) {
      if (
        next === charCodes.dash &&
        !this.inModule &&
        this.input.charCodeAt(this.state.pos + 2) === charCodes.greaterThan &&
        lineBreak.test(this.input.slice(this.state.lastTokEnd, this.state.pos))
      ) {
        // A `-->` line comment
        this.skipLineComment(3);
        this.skipSpace();
        this.nextToken();
        return;
      }
      this.finishOp(tt.incDec, 2);
      return;
    }

    if (next === charCodes.equalsTo) {
      this.finishOp(tt.assign, 2);
    } else {
      this.finishOp(tt.plusMin, 1);
    }
  }

  readToken_lt_gt(code: number): void {
    // '<>'
    const next = this.input.charCodeAt(this.state.pos + 1);
    let size = 1;

    if (next === code) {
      size =
        code === charCodes.greaterThan &&
        this.input.charCodeAt(this.state.pos + 2) === charCodes.greaterThan
          ? 3
          : 2;
      if (this.input.charCodeAt(this.state.pos + size) === charCodes.equalsTo) {
        this.finishOp(tt.assign, size + 1);
        return;
      }
      this.finishOp(tt.bitShift, size);
      return;
    }

    if (
      next === charCodes.exclamationMark &&
      code === charCodes.lessThan &&
      !this.inModule &&
      this.input.charCodeAt(this.state.pos + 2) === charCodes.dash &&
      this.input.charCodeAt(this.state.pos + 3) === charCodes.dash
    ) {
      // `<!--`, an XML-style comment that should be interpreted as a line comment
      this.skipLineComment(4);
      this.skipSpace();
      this.nextToken();
      return;
    }

    if (next === charCodes.equalsTo) {
      // <= | >=
      size = 2;
    }

    this.finishOp(tt.relational, size);
  }

  readToken_eq_excl(code: number): void {
    // '=!'
    const next = this.input.charCodeAt(this.state.pos + 1);
    if (next === charCodes.equalsTo) {
      this.finishOp(
        tt.equality,
        this.input.charCodeAt(this.state.pos + 2) === charCodes.equalsTo
          ? 3
          : 2,
      );
      return;
    }
    if (code === charCodes.equalsTo && next === charCodes.greaterThan) {
      // '=>'
      this.state.pos += 2;
      this.finishToken(tt.arrow);
      return;
    }
    this.finishOp(code === charCodes.equalsTo ? tt.eq : tt.bang, 1);
  }

  readToken_question(): void {
    // '?'
    const next = this.input.charCodeAt(this.state.pos + 1);
    const next2 = this.input.charCodeAt(this.state.pos + 2);
    if (next === charCodes.questionMark && !this.state.inType) {
      if (next2 === charCodes.equalsTo) {
        // '??='
        this.finishOp(tt.assign, 3);
      } else {
        // '??'
        this.finishOp(tt.nullishCoalescing, 2);
      }
    } else if (
      next === charCodes.dot &&
      !(next2 >= charCodes.digit0 && next2 <= charCodes.digit9)
    ) {
      // '.' not followed by a number
      this.state.pos += 2;
      this.finishToken(tt.questionDot);
    } else {
      ++this.state.pos;
      this.finishToken(tt.question);
    }
  }

  getTokenFromCode(code: number): void {
    switch (code) {
      case charCodes.numberSign:
        if (this.state.pos === 0 && this.readToken_interpreter()) {
          return;
        }

        if (
          (this.hasPlugin("classPrivateProperties") ||
            this.hasPlugin("classPrivateMethods")) &&
          this.state.classLevel > 0
        ) {
          ++this.state.pos;
          this.finishToken(tt.hash);
          return;
        } else {
          this.raise(
            this.state.pos,
            `Unexpected character '${String.fromCodePoint(code)}'`,
          );
        }

      // The interpretation of a dot depends on whether it is followed
      // by a digit or another two dots.

      case charCodes.dot:
        this.readToken_dot();
        return;

      // Punctuation tokens.
      case charCodes.leftParenthesis:
        ++this.state.pos;
        this.finishToken(tt.parenL);
        return;
      case charCodes.rightParenthesis:
        ++this.state.pos;
        this.finishToken(tt.parenR);
        return;
      case charCodes.semicolon:
        ++this.state.pos;
        this.finishToken(tt.semi);
        return;
      case charCodes.comma:
        ++this.state.pos;
        this.finishToken(tt.comma);
        return;
      case charCodes.leftSquareBracket:
        ++this.state.pos;
        this.finishToken(tt.bracketL);
        return;
      case charCodes.rightSquareBracket:
        ++this.state.pos;
        this.finishToken(tt.bracketR);
        return;

      case charCodes.leftCurlyBrace:
        if (
          this.hasPlugin("flow") &&
          this.input.charCodeAt(this.state.pos + 1) === charCodes.verticalBar
        ) {
          this.finishOp(tt.braceBarL, 2);
        } else {
          ++this.state.pos;
          this.finishToken(tt.braceL);
        }
        return;

      case charCodes.rightCurlyBrace:
        ++this.state.pos;
        this.finishToken(tt.braceR);
        return;

      case charCodes.colon:
        if (
          this.hasPlugin("functionBind") &&
          this.input.charCodeAt(this.state.pos + 1) === charCodes.colon
        ) {
          this.finishOp(tt.doubleColon, 2);
        } else {
          ++this.state.pos;
          this.finishToken(tt.colon);
        }
        return;

      case charCodes.questionMark:
        this.readToken_question();
        return;

      case charCodes.atSign:
        ++this.state.pos;
        this.finishToken(tt.at);
        return;

      case charCodes.graveAccent:
        ++this.state.pos;
        this.finishToken(tt.backQuote);
        return;

      case charCodes.digit0: {
        const next = this.input.charCodeAt(this.state.pos + 1);
        // '0x', '0X' - hex number
        if (next === charCodes.lowercaseX || next === charCodes.uppercaseX) {
          this.readRadixNumber(16);
          return;
        }
        // '0o', '0O' - octal number
        if (next === charCodes.lowercaseO || next === charCodes.uppercaseO) {
          this.readRadixNumber(8);
          return;
        }
        // '0b', '0B' - binary number
        if (next === charCodes.lowercaseB || next === charCodes.uppercaseB) {
          this.readRadixNumber(2);
          return;
        }
      }
      // Anything else beginning with a digit is an integer, octal
      // number, or float.
      case charCodes.digit1:
      case charCodes.digit2:
      case charCodes.digit3:
      case charCodes.digit4:
      case charCodes.digit5:
      case charCodes.digit6:
      case charCodes.digit7:
      case charCodes.digit8:
      case charCodes.digit9:
        this.readNumber(false);
        return;

      // Quotes produce strings.
      case charCodes.quotationMark:
      case charCodes.apostrophe:
        this.readString(code);
        return;

      // Operators are parsed inline in tiny state machines. '=' (charCodes.equalsTo) is
      // often referred to. `finishOp` simply skips the amount of
      // characters it is given as second argument, and returns a token
      // of the type given by its first argument.

      case charCodes.slash:
        this.readToken_slash();
        return;

      case charCodes.percentSign:
      case charCodes.asterisk:
        this.readToken_mult_modulo(code);
        return;

      case charCodes.verticalBar:
      case charCodes.ampersand:
        this.readToken_pipe_amp(code);
        return;

      case charCodes.caret:
        this.readToken_caret();
        return;

      case charCodes.plusSign:
      case charCodes.dash:
        this.readToken_plus_min(code);
        return;

      case charCodes.lessThan:
      case charCodes.greaterThan:
        this.readToken_lt_gt(code);
        return;

      case charCodes.equalsTo:
      case charCodes.exclamationMark:
        this.readToken_eq_excl(code);
        return;

      case charCodes.tilde:
        this.finishOp(tt.tilde, 1);
        return;
    }

    this.raise(
      this.state.pos,
      `Unexpected character '${String.fromCodePoint(code)}'`,
    );
  }

  finishOp(type: TokenType, size: number): void {
    const str = this.input.slice(this.state.pos, this.state.pos + size);
    this.state.pos += size;
    this.finishToken(type, str);
  }

  readRegexp(): void {
    const start = this.state.pos;
    let escaped, inClass;
    for (;;) {
      if (this.state.pos >= this.input.length) {
        this.raise(start, "Unterminated regular expression");
      }
      const ch = this.input.charAt(this.state.pos);
      if (lineBreak.test(ch)) {
        this.raise(start, "Unterminated regular expression");
      }
      if (escaped) {
        escaped = false;
      } else {
        if (ch === "[") {
          inClass = true;
        } else if (ch === "]" && inClass) {
          inClass = false;
        } else if (ch === "/" && !inClass) {
          break;
        }
        escaped = ch === "\\";
      }
      ++this.state.pos;
    }
    const content = this.input.slice(start, this.state.pos);
    ++this.state.pos;

    let mods = "";

    while (this.state.pos < this.input.length) {
      const char = this.input[this.state.pos];
      const charCode = this.input.codePointAt(this.state.pos);

      if (VALID_REGEX_FLAGS.indexOf(char) > -1) {
        if (mods.indexOf(char) > -1) {
          this.raise(this.state.pos + 1, "Duplicate regular expression flag");
        }

        ++this.state.pos;
        mods += char;
      } else if (
        isIdentifierChar(charCode) ||
        charCode === charCodes.backslash
      ) {
        this.raise(this.state.pos + 1, "Invalid regular expression flag");
      } else {
        break;
      }
    }

    this.finishToken(tt.regexp, {
      pattern: content,
      flags: mods,
    });
  }

  // Read an integer in the given radix. Return null if zero digits
  // were read, the integer value otherwise. When `len` is given, this
  // will return `null` unless the integer has exactly `len` digits.

  readInt(radix: number, len?: number): number | null {
    const start = this.state.pos;
    const forbiddenSiblings =
      radix === 16
        ? forbiddenNumericSeparatorSiblings.hex
        : forbiddenNumericSeparatorSiblings.decBinOct;
    const allowedSiblings =
      radix === 16
        ? allowedNumericSeparatorSiblings.hex
        : radix === 10
          ? allowedNumericSeparatorSiblings.dec
          : radix === 8
            ? allowedNumericSeparatorSiblings.oct
            : allowedNumericSeparatorSiblings.bin;

    let total = 0;

    for (let i = 0, e = len == null ? Infinity : len; i < e; ++i) {
      const code = this.input.charCodeAt(this.state.pos);
      let val;

      if (this.hasPlugin("numericSeparator")) {
        const prev = this.input.charCodeAt(this.state.pos - 1);
        const next = this.input.charCodeAt(this.state.pos + 1);
        if (code === charCodes.underscore) {
          if (allowedSiblings.indexOf(next) === -1) {
            this.raise(this.state.pos, "Invalid or unexpected token");
          }

          if (
            forbiddenSiblings.indexOf(prev) > -1 ||
            forbiddenSiblings.indexOf(next) > -1 ||
            Number.isNaN(next)
          ) {
            this.raise(this.state.pos, "Invalid or unexpected token");
          }

          // Ignore this _ character
          ++this.state.pos;
          continue;
        }
      }

      if (code >= charCodes.lowercaseA) {
        val = code - charCodes.lowercaseA + charCodes.lineFeed;
      } else if (code >= charCodes.uppercaseA) {
        val = code - charCodes.uppercaseA + charCodes.lineFeed;
      } else if (charCodes.isDigit(code)) {
        val = code - charCodes.digit0; // 0-9
      } else {
        val = Infinity;
      }
      if (val >= radix) break;
      ++this.state.pos;
      total = total * radix + val;
    }
    if (
      this.state.pos === start ||
      (len != null && this.state.pos - start !== len)
    ) {
      return null;
    }

    return total;
  }

  readRadixNumber(radix: number): void {
    const start = this.state.pos;
    let isBigInt = false;

    this.state.pos += 2; // 0x
    const val = this.readInt(radix);
    if (val == null) {
      this.raise(this.state.start + 2, "Expected number in radix " + radix);
    }

    if (this.hasPlugin("bigInt")) {
      if (this.input.charCodeAt(this.state.pos) === charCodes.lowercaseN) {
        ++this.state.pos;
        isBigInt = true;
      }
    }

    if (isIdentifierStart(this.input.codePointAt(this.state.pos))) {
      this.raise(this.state.pos, "Identifier directly after number");
    }

    if (isBigInt) {
      const str = this.input.slice(start, this.state.pos).replace(/[_n]/g, "");
      this.finishToken(tt.bigint, str);
      return;
    }

    this.finishToken(tt.num, val);
  }

  // Read an integer, octal integer, or floating-point number.

  readNumber(startsWithDot: boolean): void {
    const start = this.state.pos;
    let octal = this.input.charCodeAt(start) === charCodes.digit0;
    let isFloat = false;
    let isBigInt = false;

    if (!startsWithDot && this.readInt(10) === null) {
      this.raise(start, "Invalid number");
    }
    if (octal && this.state.pos == start + 1) octal = false; // number === 0

    let next = this.input.charCodeAt(this.state.pos);
    if (next === charCodes.dot && !octal) {
      ++this.state.pos;
      this.readInt(10);
      isFloat = true;
      next = this.input.charCodeAt(this.state.pos);
    }

    if (
      (next === charCodes.uppercaseE || next === charCodes.lowercaseE) &&
      !octal
    ) {
      next = this.input.charCodeAt(++this.state.pos);
      if (next === charCodes.plusSign || next === charCodes.dash) {
        ++this.state.pos;
      }
      if (this.readInt(10) === null) this.raise(start, "Invalid number");
      isFloat = true;
      next = this.input.charCodeAt(this.state.pos);
    }

    if (this.hasPlugin("bigInt")) {
      if (next === charCodes.lowercaseN) {
        // disallow floats and legacy octal syntax, new style octal ("0o") is handled in this.readRadixNumber
        if (isFloat || octal) this.raise(start, "Invalid BigIntLiteral");
        ++this.state.pos;
        isBigInt = true;
      }
    }

    if (isIdentifierStart(this.input.codePointAt(this.state.pos))) {
      this.raise(this.state.pos, "Identifier directly after number");
    }

    // remove "_" for numeric literal separator, and "n" for BigInts
    const str = this.input.slice(start, this.state.pos).replace(/[_n]/g, "");

    if (isBigInt) {
      this.finishToken(tt.bigint, str);
      return;
    }

    let val;
    if (isFloat) {
      val = parseFloat(str);
    } else if (!octal || str.length === 1) {
      val = parseInt(str, 10);
    } else if (this.state.strict) {
      this.raise(start, "Invalid number");
    } else if (/[89]/.test(str)) {
      val = parseInt(str, 10);
    } else {
      val = parseInt(str, 8);
    }
    this.finishToken(tt.num, val);
  }

  // Read a string value, interpreting backslash-escapes.

  readCodePoint(throwOnInvalid: boolean): number | null {
    const ch = this.input.charCodeAt(this.state.pos);
    let code;

    if (ch === charCodes.leftCurlyBrace) {
      const codePos = ++this.state.pos;
      code = this.readHexChar(
        this.input.indexOf("}", this.state.pos) - this.state.pos,
        throwOnInvalid,
      );
      ++this.state.pos;
      if (code === null) {
        // $FlowFixMe (is this always non-null?)
        --this.state.invalidTemplateEscapePosition; // to point to the '\'' instead of the 'u'
      } else if (code > 0x10ffff) {
        if (throwOnInvalid) {
          this.raise(codePos, "Code point out of bounds");
        } else {
          this.state.invalidTemplateEscapePosition = codePos - 2;
          return null;
        }
      }
    } else {
      code = this.readHexChar(4, throwOnInvalid);
    }
    return code;
  }

  readString(quote: number): void {
    let out = "",
      chunkStart = ++this.state.pos;
    const hasJsonStrings = this.hasPlugin("jsonStrings");
    for (;;) {
      if (this.state.pos >= this.input.length) {
        this.raise(this.state.start, "Unterminated string constant");
      }
      const ch = this.input.charCodeAt(this.state.pos);
      if (ch === quote) break;
      if (ch === charCodes.backslash) {
        out += this.input.slice(chunkStart, this.state.pos);
        // $FlowFixMe
        out += this.readEscapedChar(false);
        chunkStart = this.state.pos;
      } else if (
        hasJsonStrings &&
        (ch === charCodes.lineSeparator || ch === charCodes.paragraphSeparator)
      ) {
        ++this.state.pos;
      } else if (isNewLine(ch)) {
        this.raise(this.state.start, "Unterminated string constant");
      } else {
        ++this.state.pos;
      }
    }
    out += this.input.slice(chunkStart, this.state.pos++);
    this.finishToken(tt.string, out);
  }

  // Reads template string tokens.

  readTmplToken(): void {
    let out = "",
      chunkStart = this.state.pos,
      containsInvalid = false;
    for (;;) {
      if (this.state.pos >= this.input.length) {
        this.raise(this.state.start, "Unterminated template");
      }
      const ch = this.input.charCodeAt(this.state.pos);
      if (
        ch === charCodes.graveAccent ||
        (ch === charCodes.dollarSign &&
          this.input.charCodeAt(this.state.pos + 1) ===
            charCodes.leftCurlyBrace)
      ) {
        if (this.state.pos === this.state.start && this.match(tt.template)) {
          if (ch === charCodes.dollarSign) {
            this.state.pos += 2;
            this.finishToken(tt.dollarBraceL);
            return;
          } else {
            ++this.state.pos;
            this.finishToken(tt.backQuote);
            return;
          }
        }
        out += this.input.slice(chunkStart, this.state.pos);
        this.finishToken(tt.template, containsInvalid ? null : out);
        return;
      }
      if (ch === charCodes.backslash) {
        out += this.input.slice(chunkStart, this.state.pos);
        const escaped = this.readEscapedChar(true);
        if (escaped === null) {
          containsInvalid = true;
        } else {
          out += escaped;
        }
        chunkStart = this.state.pos;
      } else if (isNewLine(ch)) {
        out += this.input.slice(chunkStart, this.state.pos);
        ++this.state.pos;
        switch (ch) {
          case charCodes.carriageReturn:
            if (this.input.charCodeAt(this.state.pos) === charCodes.lineFeed) {
              ++this.state.pos;
            }
          case charCodes.lineFeed:
            out += "\n";
            break;
          default:
            out += String.fromCharCode(ch);
            break;
        }
        ++this.state.curLine;
        this.state.lineStart = this.state.pos;
        chunkStart = this.state.pos;
      } else {
        ++this.state.pos;
      }
    }
  }

  // Used to read escaped characters

  readEscapedChar(inTemplate: boolean): string | null {
    const throwOnInvalid = !inTemplate;
    const ch = this.input.charCodeAt(++this.state.pos);
    ++this.state.pos;
    switch (ch) {
      case charCodes.lowercaseN:
        return "\n";
      case charCodes.lowercaseR:
        return "\r";
      case charCodes.lowercaseX: {
        const code = this.readHexChar(2, throwOnInvalid);
        return code === null ? null : String.fromCharCode(code);
      }
      case charCodes.lowercaseU: {
        const code = this.readCodePoint(throwOnInvalid);
        return code === null ? null : String.fromCodePoint(code);
      }
      case charCodes.lowercaseT:
        return "\t";
      case charCodes.lowercaseB:
        return "\b";
      case charCodes.lowercaseV:
        return "\u000b";
      case charCodes.lowercaseF:
        return "\f";
      case charCodes.carriageReturn:
        if (this.input.charCodeAt(this.state.pos) === charCodes.lineFeed) {
          ++this.state.pos;
        }
      case charCodes.lineFeed:
        this.state.lineStart = this.state.pos;
        ++this.state.curLine;
        return "";
      default:
        if (ch >= charCodes.digit0 && ch <= charCodes.digit7) {
          const codePos = this.state.pos - 1;
          // $FlowFixMe
          let octalStr = this.input
            .substr(this.state.pos - 1, 3)
            .match(/^[0-7]+/)[0];
          let octal = parseInt(octalStr, 8);
          if (octal > 255) {
            octalStr = octalStr.slice(0, -1);
            octal = parseInt(octalStr, 8);
          }
          if (octal > 0) {
            if (inTemplate) {
              this.state.invalidTemplateEscapePosition = codePos;
              return null;
            } else if (this.state.strict) {
              this.raise(codePos, "Octal literal in strict mode");
            } else if (!this.state.containsOctal) {
              // These properties are only used to throw an error for an octal which occurs
              // in a directive which occurs prior to a "use strict" directive.
              this.state.containsOctal = true;
              this.state.octalPosition = codePos;
            }
          }
          this.state.pos += octalStr.length - 1;
          return String.fromCharCode(octal);
        }
        return String.fromCharCode(ch);
    }
  }

  // Used to read character escape sequences ('\x', '\u').

  readHexChar(len: number, throwOnInvalid: boolean): number | null {
    const codePos = this.state.pos;
    const n = this.readInt(16, len);
    if (n === null) {
      if (throwOnInvalid) {
        this.raise(codePos, "Bad character escape sequence");
      } else {
        this.state.pos = codePos - 1;
        this.state.invalidTemplateEscapePosition = codePos - 1;
      }
    }
    return n;
  }

  // Read an identifier, and return it as a string. Sets `this.state.containsEsc`
  // to whether the word contained a '\u' escape.
  //
  // Incrementally adds only escaped chars, adding other chunks as-is
  // as a micro-optimization.

  readWord1(): string {
    this.state.containsEsc = false;
    let word = "",
      first = true,
      chunkStart = this.state.pos;
    while (this.state.pos < this.input.length) {
      const ch = this.input.codePointAt(this.state.pos);
      if (isIdentifierChar(ch)) {
        this.state.pos += ch <= 0xffff ? 1 : 2;
      } else if (this.state.isIterator && ch === charCodes.atSign) {
        this.state.pos += 1;
      } else if (ch === charCodes.backslash) {
        this.state.containsEsc = true;

        word += this.input.slice(chunkStart, this.state.pos);
        const escStart = this.state.pos;

        if (this.input.charCodeAt(++this.state.pos) !== charCodes.lowercaseU) {
          this.raise(
            this.state.pos,
            "Expecting Unicode escape sequence \\uXXXX",
          );
        }

        ++this.state.pos;
        const esc = this.readCodePoint(true);
        // $FlowFixMe (thinks esc may be null, but throwOnInvalid is true)
        if (!(first ? isIdentifierStart : isIdentifierChar)(esc, true)) {
          this.raise(escStart, "Invalid Unicode escape");
        }

        // $FlowFixMe
        word += String.fromCodePoint(esc);
        chunkStart = this.state.pos;
      } else {
        break;
      }
      first = false;
    }
    return word + this.input.slice(chunkStart, this.state.pos);
  }

  isIterator(word: string): boolean {
    return word === "@@iterator" || word === "@@asyncIterator";
  }

  // Read an identifier or keyword token. Will check for reserved
  // words when necessary.

  readWord(): void {
    const word = this.readWord1();
    let type = tt.name;

    if (this.isKeyword(word)) {
      if (this.state.containsEsc) {
        this.raise(this.state.pos, `Escape sequence in keyword ${word}`);
      }

      type = keywordTypes[word];
    }

    // Allow @@iterator and @@asyncIterator as a identifier only inside type
    if (
      this.state.isIterator &&
      (!this.isIterator(word) || !this.state.inType)
    ) {
      this.raise(this.state.pos, `Invalid identifier ${word}`);
    }

    this.finishToken(type, word);
  }

  braceIsBlock(prevType: TokenType): boolean {
    if (prevType === tt.colon) {
      const parent = this.curContext();
      if (parent === ct.braceStatement || parent === ct.braceExpression) {
        return !parent.isExpr;
      }
    }

    if (prevType === tt._return) {
      return lineBreak.test(
        this.input.slice(this.state.lastTokEnd, this.state.start),
      );
    }

    if (
      prevType === tt._else ||
      prevType === tt.semi ||
      prevType === tt.eof ||
      prevType === tt.parenR
    ) {
      return true;
    }

    if (prevType === tt.braceL) {
      return this.curContext() === ct.braceStatement;
    }

    if (prevType === tt.relational) {
      // `class C<T> { ... }`
      return true;
    }

    return !this.state.exprAllowed;
  }

  updateContext(prevType: TokenType): void {
    const type = this.state.type;
    let update;

    if (type.keyword && (prevType === tt.dot || prevType === tt.questionDot)) {
      this.state.exprAllowed = false;
    } else if ((update = type.updateContext)) {
      update.call(this, prevType);
    } else {
      this.state.exprAllowed = type.beforeExpr;
    }
  }
}
