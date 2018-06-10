// test jison negative index reference variables recognition:
$$ = {
	val: $-1 + a.tx(`blub: ${$$-2} @ ${@@-3} vs. ${##-4}?`),
	loc: @-5,
	idx: #-6,
};