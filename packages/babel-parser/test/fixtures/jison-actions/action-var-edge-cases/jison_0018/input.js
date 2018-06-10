// any jison var referencing current value is okay: $$, @$, #$, ##$, #$#
$$ = 0;
@$.range = [1, 2];
// highly suspect as the next few are considered strictly CONSTANTS/RVALUES in JISON:
#$--;
##$--;
#$#--;
