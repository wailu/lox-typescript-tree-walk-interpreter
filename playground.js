"use strict";

const e = React.createElement;
const runProgram = window.lox.runProgram;

const LoxPlayground = () => {
  const [source, setSource] = React.useState(
    "// write your lox program here!\n"
  );
  const [{ output, errors, code }, setResult] = React.useState({
    output: [],
    errors: [],
    code: 0,
  });

  console.log(output, errors, code);

  const runProgram = (source) => {
    setResult(window.lox.runProgram(source));
  };

  return e(
    "div",
    {
      className: "lox_playground",
    },
    e(
      "div",
      { className: "lox_playground_actions" },
      e(
        "button",
        {
          onClick: () => runProgram(source),
        },
        "Run"
      )
    ),
    e(
      "div",
      {
        className: "lox_playground_content",
      },
      e(
        "div",
        {
          className: "lox_playground_left",
        },
        e("textarea", {
          rows: 20,
          cols: 50,
          value: source,
          onChange: (e) => setSource(e.target.value ?? ""),
        })
      ),
      e(
        "div",
        { className: "lox_playground_content_right" },
        e("div", { className: "lox_playground_output" }, output.join("\n")),
        !!errors.length &&
          e("div", { className: "lox_playground_error" }, errors.join("\n"))
      )
    )
  );
};

const domContainer = document.getElementById("lox_playground_container");
const root = ReactDOM.createRoot(domContainer);
root.render(e(LoxPlayground));
