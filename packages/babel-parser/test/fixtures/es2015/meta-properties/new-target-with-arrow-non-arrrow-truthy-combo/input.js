function nonArrow() {
  const arrow = () => {
    console.log(new.target);
  };
}

function nonArrow1() {
  function nonArrow1Inner() {}

  const arrow = () => {
    console.log(new.target);
  };
}

function nonArrow2() {
  const arrow1 = () => {
    console.log(new.target);
  };

  function nonArrow1Inner() {}

  const arrow2 = () => {
    console.log(new.target);
  };
}

function nonArrow3() {
  const arrow1 = () => {
    function nonArrow1Inner() {}

    const arrow2 = () => {
      console.log(new.target);
    };
  };
}

function nonArrow4() {
  function nonArrow() {
    console.log(new.target);
    const arrow1 = () => {
      console.log(new.target);
      function nonArrow1Inner() {
        console.log(new.target);
      }
      const arrow2 = () => {
        console.log(new.target);
      };
    };
  }
}
