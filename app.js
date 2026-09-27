// ========================================
// HPP CALCULATOR
// STEP 8A.3
// Display + Modal Architecture
// ========================================


// ========================================
// APP STATE
// ========================================

const state = {

    product: {
        name: "",
        yieldQuantity: 0,
        yieldUnit: "pcs"
    },

    ingredients: [],

    additionalCost: 0

};


// ID bahan yang sedang diedit

let editingIngredientId = null;


// ========================================
// DOM ELEMENTS
// ========================================

// Product

const productDisplay =
    document.getElementById("productDisplay");

const addProductButton =
    document.getElementById("addProductButton");

const editProductButton =
    document.getElementById("editProductButton");

const productModal =
    document.getElementById("productModal");

const productModalTitle =
    document.getElementById("productModalTitle");

const productNameInput =
    document.getElementById("productNameInput");

const yieldQuantityInput =
    document.getElementById("yieldQuantityInput");

const yieldUnitInput =
    document.getElementById("yieldUnitInput");

const saveProductButton =
    document.getElementById("saveProductButton");


// Ingredients

const ingredientsDisplay =
    document.getElementById("ingredientsDisplay");

const addIngredientButton =
    document.getElementById("addIngredientButton");

const ingredientModal =
    document.getElementById("ingredientModal");

const ingredientModalTitle =
    document.getElementById("ingredientModalTitle");

const ingredientNameInput =
    document.getElementById("ingredientNameInput");

const ingredientPriceInput =
    document.getElementById("ingredientPriceInput");

const ingredientPurchaseQuantityInput =
    document.getElementById(
        "ingredientPurchaseQuantityInput"
    );

const ingredientPurchaseUnitInput =
    document.getElementById(
        "ingredientPurchaseUnitInput"
    );

const ingredientUsageQuantityInput =
    document.getElementById(
        "ingredientUsageQuantityInput"
    );

const ingredientUsageUnitInput =
    document.getElementById(
        "ingredientUsageUnitInput"
    );

const ingredientCalculationPreview =
    document.getElementById(
        "ingredientCalculationPreview"
    );

const ingredientValidationMessage =
    document.getElementById(
        "ingredientValidationMessage"
    );

const saveIngredientButton =
    document.getElementById(
        "saveIngredientButton"
    );

const deleteIngredientButton =
    document.getElementById(
        "deleteIngredientButton"
    );


// Additional Cost

const additionalCostDisplay =
    document.getElementById(
        "additionalCostDisplay"
    );

const addAdditionalCostButton =
    document.getElementById(
        "addAdditionalCostButton"
    );

const additionalCostModal =
    document.getElementById(
        "additionalCostModal"
    );

const additionalCostInput =
    document.getElementById(
        "additionalCostInput"
    );

const saveAdditionalCostButton =
    document.getElementById(
        "saveAdditionalCostButton"
    );


// Result

const totalIngredientCostElement =
    document.getElementById(
        "totalIngredientCost"
    );

const totalAdditionalCostElement =
    document.getElementById(
        "totalAdditionalCost"
    );

const totalProductionCostElement =
    document.getElementById(
        "totalProductionCost"
    );

const hppPerUnitElement =
    document.getElementById(
        "hppPerUnit"
    );


// ========================================
// UNIT DEFINITIONS
// ========================================

const UNIT_DEFINITIONS = {

    kg: {
        category: "weight",
        baseUnit: "g",
        multiplier: 1000
    },

    g: {
        category: "weight",
        baseUnit: "g",
        multiplier: 1
    },

    L: {
        category: "volume",
        baseUnit: "ml",
        multiplier: 1000
    },

    ml: {
        category: "volume",
        baseUnit: "ml",
        multiplier: 1
    },

    pcs: {
        category: "count",
        baseUnit: "pcs",
        multiplier: 1
    },

    unit: {
        category: "count",
        baseUnit: "pcs",
        multiplier: 1
    },

    butir: {
        category: "count",
        baseUnit: "pcs",
        multiplier: 1
    }

};


// ========================================
// FORMAT RUPIAH
// ========================================

function formatRupiah(value) {

    const number = Number(value) || 0;

    return new Intl.NumberFormat("id-ID", {

        style: "currency",

        currency: "IDR",

        maximumFractionDigits: 0

    }).format(number);

}


// ========================================
// UNIT CONVERSION
// ========================================

function convertToBaseUnit(
    quantity,
    unit
) {

    const definition =
        UNIT_DEFINITIONS[unit];

    if (!definition) {
        return null;
    }

    return (
        Number(quantity) *
        definition.multiplier
    );

}


// ========================================
// UNIT COMPATIBILITY
// ========================================

function areUnitsCompatible(
    purchaseUnit,
    usageUnit
) {

    const purchase =
        UNIT_DEFINITIONS[purchaseUnit];

    const usage =
        UNIT_DEFINITIONS[usageUnit];

    if (!purchase || !usage) {
        return false;
    }

    return (
        purchase.category ===
        usage.category
    );

}


// ========================================
// CALCULATE INGREDIENT COST
// ========================================

function calculateIngredientCost(
    ingredient
) {

    const price =
        Number(ingredient.purchasePrice) || 0;

    const purchaseQuantity =
        Number(
            ingredient.purchaseQuantity
        ) || 0;

    const usageQuantity =
        Number(
            ingredient.usageQuantity
        ) || 0;


    if (
        price <= 0 ||
        purchaseQuantity <= 0 ||
        usageQuantity <= 0
    ) {

        return 0;

    }


    if (
        !areUnitsCompatible(
            ingredient.purchaseUnit,
            ingredient.usageUnit
        )
    ) {

        return 0;

    }


    const purchaseBase =
        convertToBaseUnit(
            purchaseQuantity,
            ingredient.purchaseUnit
        );

    const usageBase =
        convertToBaseUnit(
            usageQuantity,
            ingredient.usageUnit
        );


    if (
        purchaseBase <= 0 ||
        usageBase <= 0
    ) {

        return 0;

    }


    return (
        price /
        purchaseBase
    ) * usageBase;

}


// ========================================
// TOTAL INGREDIENT COST
// ========================================

function getTotalIngredientCost() {

    return state.ingredients.reduce(

        (total, ingredient) => {

            return (
                total +
                calculateIngredientCost(
                    ingredient
                )
            );

        },

        0

    );

}


// ========================================
// TOTAL PRODUCTION COST
// ========================================

function getTotalProductionCost() {

    return (
        getTotalIngredientCost() +
        Number(state.additionalCost || 0)
    );

}


// ========================================
// HPP PER UNIT
// ========================================

function getHppPerUnit() {

    const yieldQuantity =
        Number(
            state.product.yieldQuantity
        ) || 0;


    if (yieldQuantity <= 0) {
        return 0;
    }


    return (
        getTotalProductionCost() /
        yieldQuantity
    );

}


// ========================================
// MODAL HELPERS
// ========================================

function openModal(modal) {

    modal.classList.remove("hidden");

    document.body.classList.add(
        "modal-open"
    );

}


function closeModal(modal) {

    modal.classList.add("hidden");

    document.body.classList.remove(
        "modal-open"
    );

}


// ========================================
// PRODUCT DISPLAY
// ========================================

function renderProduct() {

    const hasProduct =
        state.product.name.trim() !== "";


    if (!hasProduct) {

        editProductButton.style.display =
            "none";


        productDisplay.innerHTML = `

            <div class="empty-state">

                <div class="empty-icon">
                    +
                </div>

                <strong>
                    Belum ada produk
                </strong>

                <p>
                    Tambahkan nama produk
                    untuk memulai.
                </p>

                <button
                    type="button"
                    id="emptyAddProductButton"
                    class="button primary"
                >
                    + Tambah Produk
                </button>

            </div>

        `;


        const button =
            document.getElementById(
                "emptyAddProductButton"
            );


        button.addEventListener(
            "click",
            openAddProductModal
        );


        return;

    }


    editProductButton.style.display =
        "block";


    productDisplay.innerHTML = `

        <div class="product-display-card">

            <div>

                <div class="product-name">
                    ${escapeHtml(
                        state.product.name
                    )}
                </div>

                <div class="product-yield">
                    ${formatNumber(
                        state.product.yieldQuantity
                    )}
                    ${escapeHtml(
                        state.product.yieldUnit
                    )}
                </div>

            </div>

            <button
                type="button"
                class="edit-text-button"
                id="productDisplayEditButton"
            >
                Edit
            </button>

        </div>

    `;


    document
        .getElementById(
            "productDisplayEditButton"
        )
        .addEventListener(
            "click",
            openEditProductModal
        );

}


// ========================================
// INGREDIENT DISPLAY
// ========================================

function renderIngredients() {

    if (state.ingredients.length === 0) {

        ingredientsDisplay.innerHTML = `

            <div class="empty-state">

                <div class="empty-icon">
                    +
                </div>

                <strong>
                    Belum ada bahan
                </strong>

                <p>
                    Tambahkan bahan yang
                    digunakan dalam resep.
                </p>

            </div>

        `;

        return;

    }


    const list =
        document.createElement("div");

    list.className =
        "ingredient-list";


    state.ingredients.forEach(
        ingredient => {

            const cost =
                calculateIngredientCost(
                    ingredient
                );


            const item =
                document.createElement("div");

            item.className =
                "ingredient-item";


            item.innerHTML = `

                <div class="ingredient-main">

                    <div>

                        <div
                            class="ingredient-name-display"
                        >
                            ${escapeHtml(
                                ingredient.name
                            )}
                        </div>

                        <div
                            class="ingredient-usage-display"
                        >
                            Digunakan:
                            ${formatNumber(
                                ingredient.usageQuantity
                            )}
                            ${escapeHtml(
                                ingredient.usageUnit
                            )}
                        </div>

                        <div
                            class="ingredient-cost-display"
                        >
                            ${formatRupiah(cost)}
                        </div>

                    </div>

                    <button
                        type="button"
                        class="ingredient-edit-button"
                        data-id="${ingredient.id}"
                    >
                        Edit
                    </button>

                </div>

            `;


            list.appendChild(item);

        }
    );


    ingredientsDisplay.innerHTML = "";

    ingredientsDisplay.appendChild(list);


    ingredientsDisplay
        .querySelectorAll(
            ".ingredient-edit-button"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                function() {

                    openEditIngredientModal(
                        button.dataset.id
                    );

                }
            );

        });

}


// ========================================
// ADDITIONAL COST DISPLAY
// ========================================

function renderAdditionalCost() {

    const cost =
        Number(state.additionalCost) || 0;


    if (cost <= 0) {

        additionalCostDisplay.innerHTML = `

            <div class="empty-state compact">

                <strong>
                    Belum ada biaya tambahan
                </strong>

                <p>
                    Gas, listrik, packaging,
                    dan labor dapat ditambahkan.
                </p>

            </div>

        `;

        return;

    }


    additionalCostDisplay.innerHTML = `

        <div class="product-display-card">

            <div>

                <div class="ingredient-name-display">
                    Biaya tambahan
                </div>

                <div class="ingredient-usage-display">
                    Simple Mode
                </div>

                <div class="ingredient-cost-display">
                    ${formatRupiah(cost)}
                </div>

            </div>

            <button
                type="button"
                class="edit-text-button"
                id="editAdditionalCostButton"
            >
                Edit
            </button>

        </div>

    `;


    document
        .getElementById(
            "editAdditionalCostButton"
        )
        .addEventListener(
            "click",
            openEditAdditionalCostModal
        );

}


// ========================================
// RENDER RESULTS
// ========================================

function renderResults() {

    const ingredientCost =
        getTotalIngredientCost();

    const additionalCost =
        Number(state.additionalCost) || 0;

    const productionCost =
        ingredientCost +
        additionalCost;

    const hppPerUnit =
        getHppPerUnit();


    totalIngredientCostElement.textContent =
        formatRupiah(
            ingredientCost
        );


    totalAdditionalCostElement.textContent =
        formatRupiah(
            additionalCost
        );


    totalProductionCostElement.textContent =
        formatRupiah(
            productionCost
        );


    hppPerUnitElement.textContent =
        formatRupiah(
            hppPerUnit
        );

}


// ========================================
// RENDER EVERYTHING
// ========================================

function renderApp() {

    renderProduct();

    renderIngredients();

    renderAdditionalCost();

    renderResults();

}


// ========================================
// PRODUCT MODAL
// ========================================

function openAddProductModal() {

    productModalTitle.textContent =
        "Tambah Produk";


    productNameInput.value =
        state.product.name;


    yieldQuantityInput.value =
        state.product.yieldQuantity || "";


    yieldUnitInput.value =
        state.product.yieldUnit || "pcs";


    openModal(productModal);

    setTimeout(
        () => productNameInput.focus(),
        100
    );

}


function openEditProductModal() {

    productModalTitle.textContent =
        "Edit Produk";


    productNameInput.value =
        state.product.name;


    yieldQuantityInput.value =
        state.product.yieldQuantity || "";


    yieldUnitInput.value =
        state.product.yieldUnit || "pcs";


    openModal(productModal);

}


function saveProduct() {

    const name =
        productNameInput.value.trim();


    const yieldQuantity =
        Number(
            yieldQuantityInput.value
        ) || 0;


    if (name === "") {

        alert(
            "Nama produk belum diisi."
        );

        productNameInput.focus();

        return;

    }


    if (yieldQuantity <= 0) {

        alert(
            "Jumlah hasil harus lebih dari 0."
        );

        yieldQuantityInput.focus();

        return;

    }


    state.product = {

        name,

        yieldQuantity,

        yieldUnit:
            yieldUnitInput.value

    };


    closeModal(productModal);

    renderApp();

}


// ========================================
// INGREDIENT MODAL
// ========================================

function resetIngredientModal() {

    editingIngredientId = null;


    ingredientNameInput.value = "";

    ingredientPriceInput.value = "";

    ingredientPurchaseQuantityInput.value =
        "";

    ingredientPurchaseUnitInput.value =
        "kg";

    ingredientUsageQuantityInput.value =
        "";

    ingredientUsageUnitInput.value =
        "g";


    ingredientCalculationPreview.innerHTML =
        "Biaya bahan: <strong>Rp0</strong>";


    ingredientValidationMessage.textContent =
        "";

    ingredientValidationMessage.classList.add(
        "hidden"
    );


    deleteIngredientButton.classList.add(
        "hidden"
    );

}


function openAddIngredientModal() {

    resetIngredientModal();


    ingredientModalTitle.textContent =
        "Tambah Bahan";


    openModal(ingredientModal);

    setTimeout(
        () => ingredientNameInput.focus(),
        100
    );

}


function openEditIngredientModal(id) {

    const ingredient =
        state.ingredients.find(
            item => String(item.id) === String(id)
        );


    if (!ingredient) {
        return;
    }


    editingIngredientId =
        ingredient.id;


    ingredientModalTitle.textContent =
        "Edit Bahan";


    ingredientNameInput.value =
        ingredient.name;


    ingredientPriceInput.value =
        ingredient.purchasePrice;


    ingredientPurchaseQuantityInput.value =
        ingredient.purchaseQuantity;


    ingredientPurchaseUnitInput.value =
        ingredient.purchaseUnit;


    ingredientUsageQuantityInput.value =
        ingredient.usageQuantity;


    ingredientUsageUnitInput.value =
        ingredient.usageUnit;


    deleteIngredientButton.classList.remove(
        "hidden"
    );


    updateIngredientPreview();


    openModal(ingredientModal);

}


function getIngredientFormData() {

    return {

        name:
            ingredientNameInput.value.trim(),

        purchasePrice:
            Number(
                ingredientPriceInput.value
            ) || 0,

        purchaseQuantity:
            Number(
                ingredientPurchaseQuantityInput.value
            ) || 0,

        purchaseUnit:
            ingredientPurchaseUnitInput.value,

        usageQuantity:
            Number(
                ingredientUsageQuantityInput.value
            ) || 0,

        usageUnit:
            ingredientUsageUnitInput.value

    };

}


function validateIngredient(data) {

    if (!data.name) {

        return "Nama bahan belum diisi.";

    }


    if (data.purchasePrice <= 0) {

        return "Harga beli harus lebih dari 0.";

    }


    if (data.purchaseQuantity <= 0) {

        return "Jumlah pembelian harus lebih dari 0.
