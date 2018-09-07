const arrow = () => {
  function nonArrow() {};

  console.log(new.target);
}
