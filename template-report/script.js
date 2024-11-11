function generatePDF() {
  window.print();
}

function filters(search) {
  if (search) {
    if (search === "passed") {
      document.getElementById("search-container").value = "✅";
    } else if (search === "failed") {
      document.getElementById("search-container").value = "❌";
    } else if (search === "all") {
      document.getElementById("search-container").value = "";
    }
  }

  this.filterList();
}

function filterList() {
  const input = document.getElementById("search-container").value.toLowerCase();
  const items = document.querySelectorAll(".element-spec");

  items.forEach((item) => {
    const text = item.textContent.toLowerCase();
    if (text.includes(input)) {
      item.classList.remove("hidden-element");
    } else {
      item.classList.add("hidden-element");
    }
  });
}
