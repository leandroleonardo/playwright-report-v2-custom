const fs = require("fs");
const path = require("path");
const { format, subHours } = require("date-fns");
let ejs = require("ejs");

/** @implements {import('@playwright/test/reporter').Reporter} */
class MyHtmlReporter {
  /* Playwright */

  constructor(options) {
    const date = new Date();

    this.title = "";
    this.results = [];
    this.specs = [];
    this.output = options.outputFile || "report.html";
    this.date = format(date, "dd/MM/yyyy, HH:mm:ss");
    this.testDuration = 0;
    this.testStatus = {
      all: 0,
      pass: 0,
      failed: 0,
      flaky: 0,
      skaipped: 0,
    };

    this.testBrowser;
  }

  onTestBegin(test) {
    //this.results.push(`<h3>🛠️ Starting test: ${test.title}</h3>`);
  }

  onTestEnd(test, result) {
    if (result.status === "skipped") {
      this.testStatus.skaipped += 1;
      this.testStatus.all += 1;
      return;
    }

    const error = test.results[0].steps[2].error;
    const statusIcon = error ? "❌" : "✅";

    if (result.status === "skipped") this.testStatus.skaipped += 1;
    else if (error) {
      this.testStatus.failed += 1;
      console.log("\x1b[31m%s\x1b[0m", "\nError:");
      console.log(`\nSpec: ${error.location.file}\n\n${error.snippet}`);
    } else if (result.status === "passed") this.testStatus.pass += 1;

    this.testBrowser = test.parent.parent.title;

    let teste = "";

    if (this.title != test.parent.title) {
      this.title = test.parent.title;
      //this.results.push(`<p class="name-spec">${this.title}</p>`);
      teste = `<p class="name-spec">${this.title}</p>`;
      this.specs.push(this.title);
    } else {
      teste = "";
    }

    if (test.parent.title)
      this.results.push(`${teste ? teste : ""}
          <div class="test-container">
            <div class="test">
              <p class="test-title">${statusIcon} ${test.title}</p>
              <p class="test-time">${(test.results[0].duration / 1000).toFixed(1) + "s"}</p>
            </div>
            <p class="spec">${test.parent.title}:${test.location.line}</p>
          </div>`);

    this.testDuration += test.results[0].duration / 1000;
    this.testStatus.all += 1;
  }

  onEnd() {
    this.generateReport();

    console.log("\n--------------------Report----------------------\n");
    console.log(`\nReport saved to report.html`);
    console.log("\x1b[32m%s\x1b[0m", `passed: ${this.testStatus.pass}`);
    console.log("\x1b[31m%s\x1b[0m", `failed: ${this.testStatus.failed}`);
    console.log("\x1b[34m%s\x1b[0m", `skaipped: ${this.testStatus.skaipped}\n`);
    console.log("\n------------------------------------------------\n");
  }

  /* New Features */

  generateReport() {
    const resultsOrganization = [];
    let content = [];

    this.specs.forEach((specTitle) => {
      this.results.forEach((result) => {
        if (result.includes(specTitle)) {
          content.push(result);
        }
      });
      resultsOrganization.push(`<div class="element-spec">${content.join("")}</div>`);
      content = [];
    });

    const html = path.join(__dirname, "./template-report/index.ejs");
    const css = path.join(__dirname, "./template-report/style.css");
    const js = path.join(__dirname, "./template-report/script.js");

    const testData = {
      //dynamicContent: this.results.join(""),
      dynamicContent: resultsOrganization.join(""),
      testDuration: this.getTestDuration(),
      testDate: this.date,
      browser: this.testBrowser,
      status: {
        all: this.testStatus.all,
        pass: this.testStatus.pass,
        failed: this.testStatus.failed,
        flaky: this.testStatus.flaky,
        skaipped: this.testStatus.skaipped,
      },
    };

    ejs.renderFile(html, { testData }, (err, html) => {
      if (err) throw err;

      // Escreve o HTML renderizado em um novo arquivo
      fs.writeFile(path.join(__dirname, "report.html"), html, (err) => {
        if (err) throw err;
      });
    });

    ejs.renderFile(css, {}, (err, css) => {
      if (err) throw err;

      // Escreve o CSS renderizado em um novo arquivo
      fs.writeFile(path.join(__dirname, "style.css"), css, (err) => {
        if (err) throw err;
      });
    });

    ejs.renderFile(js, {}, (err, js) => {
      if (err) throw err;

      // Escreve o JS renderizado em um novo arquivo
      fs.writeFile(path.join(__dirname, "script.js"), js, (err) => {
        if (err) throw err;
      });
    });

    fs.writeFileSync(path.resolve("./report", this.output), html);
    fs.writeFileSync(path.resolve("./report", this.output), css);
    fs.writeFileSync(path.resolve("./report", this.output), js);
  }

  getTestDuration() {
    /* Formata o horário e adiciona o prefixo */

    this.testDuration =
      this.testDuration < 60
        ? `${this.testDuration.toFixed(1)}s`
        : this.testDuration < 3600
        ? `${(this.testDuration / 60).toFixed(1)}m`
        : `${(this.testDuration / 3600).toFixed(1)}h`;

    return this.testDuration;
  }
}

module.exports = MyHtmlReporter;
