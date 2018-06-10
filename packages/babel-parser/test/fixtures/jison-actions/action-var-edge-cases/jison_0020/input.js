// negative index jison variables:
$$ = $-1 + $-2 + $12;
@$ = @-1 + @0;

// babel itself does not have the smarts built in to detect the wrongness in these:
#$ = #-1 + #0;
##$ = ##-1 + ##7;
#$# += #-1# + #0#;