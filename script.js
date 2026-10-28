
"use strict";

// Product categories available in the filter.
const categoryOptions = [
  { value: "all", label: "All products" },
  { value: "breads", label: "Breads" },
  { value: "pastries", label: "Pastries" },
  { value: "cakes", label: "Cakes" }
];

// Validation rules for the contact and pre-order form.
const validationRules = [
  {
    id: "name",
    message: "Please enter your name (at least 2 characters).",
    validate: value => value.trim().length >= 2
  },
  {
    id: "email",
    message: "Please enter a valid email address.",
    validate: value =>
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
  },
  {
    id: "request-type",
    message: "Please select a request type.",
    validate: value => value.trim() !== ""
  },
  {
    id: "item-details",
    message: "Please enter at least 10 characters describing your request.",
    validate: value => value.trim().length >= 10
  }
];

const FILTER_STORAGE_KEY = "northStarBakeryProductFilter";

// Set up the product filter on the products page.
function initializeProductFilter() {
  const main = document.querySelector("main");

  if (!main || !document.querySelector('a[href="products.html"]')) {
    return;
  }

  const productSections = Array.from(main.querySelectorAll("section"));
  const filterableSections = [];

  productSections.forEach(section => {
    const heading = section.querySelector("h2");
    if (!heading) return;

    const title = heading.textContent.toLowerCase();
    let category = "";

    if (title.includes("bread") || title.includes("signature loaf")) {
      category = "breads";
    } else if (title.includes("pastr")) {
      category = "pastries";
    } else if (title.includes("cake")) {
      category = "cakes";
    }

    if (category) {
      section.dataset.category = category;
      filterableSections.push(section);
    }
  });

  if (filterableSections.length === 0) return;

  const controls = document.createElement("section");
  controls.className = "product-filter";

  const label = document.createElement("label");
  label.htmlFor = "product-category";
  label.textContent = "Browse products by category:";

  const select = document.createElement("select");
  select.id = "product-category";

  categoryOptions.forEach(optionData => {
    const option = document.createElement("option");
    option.value = optionData.value;
    option.textContent = optionData.label;
    select.appendChild(option);
  });

  const status = document.createElement("p");
  status.id = "filter-status";
  status.setAttribute("aria-live", "polite");

  controls.append(label, select, status);
  main.prepend(controls);

  function applyFilter(category) {
    const validCategory = categoryOptions.some(
      option => option.value === category
    ) ? category : "all";

    select.value = validCategory;
    let visibleCount = 0;

    filterableSections.forEach(section => {
      const visible =
        validCategory === "all" ||
        section.dataset.category === validCategory;

      section.hidden = !visible;
      if (visible) visibleCount++;
    });

    status.textContent =
      `Showing ${visibleCount} product section(s).`;

    try {
      localStorage.setItem(FILTER_STORAGE_KEY, validCategory);
    } catch (error) {
      console.warn("The product preference could not be saved.");
    }
  }

  select.addEventListener("change", () => {
    applyFilter(select.value);
  });

  let savedCategory = "all";

  try {
    savedCategory = localStorage.getItem(FILTER_STORAGE_KEY) || "all";
  } catch (error) {
    console.warn("The saved product preference could not be loaded.");
  }

  applyFilter(savedCategory);
}

// Display or clear an error next to a form field.
function showFieldError(field, message) {
  const container = field.parentElement;
  const errorId = `${field.id}-error`;

  let error = document.getElementById(errorId);

  if (!error) {
    error = document.createElement("span");
    error.id = errorId;
    error.className = "field-error";
    error.setAttribute("role", "alert");
    container.appendChild(error);
  }

  error.textContent = message;
  field.setAttribute("aria-invalid", "true");
  field.setAttribute("aria-describedby", errorId);
}

function clearFieldError(field) {
  const error = document.getElementById(`${field.id}-error`);

  if (error) error.textContent = "";

  field.removeAttribute("aria-invalid");
  field.removeAttribute("aria-describedby");
}

// Validate the contact and pre-order form.
function initializeFormValidation() {
  const form = document.querySelector("form");
  if (!form) return;

  // Use our custom messages instead of browser-only validation popups.
  form.noValidate = true;

  validationRules.forEach(rule => {
    const field = document.getElementById(rule.id);
    if (!field) return;

    field.addEventListener("input", () => clearFieldError(field));
    field.addEventListener("change", () => clearFieldError(field));
  });

  form.addEventListener("submit", event => {
    let formIsValid = true;
    let firstInvalidField = null;

    validationRules.forEach(rule => {
      const field = document.getElementById(rule.id);
      if (!field) return;

      if (!rule.validate(field.value)) {
        showFieldError(field, rule.message);
        formIsValid = false;

        if (!firstInvalidField) firstInvalidField = field;
      } else {
        clearFieldError(field);
      }
    });

    if (!formIsValid) {
      event.preventDefault();
      firstInvalidField.focus();
    }
  });
}

// Initialize the features when the HTML is ready.
document.addEventListener("DOMContentLoaded", () => {
  initializeProductFilter();
  initializeFormValidation();
});
