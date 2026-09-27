// ========================================
// HPP CALCULATOR
// Display + Modal + LocalStorage
// ========================================

document.addEventListener("DOMContentLoaded", function () {

    // ========================================
    // STORAGE
    // ========================================

    const STORAGE_KEY = "hppCalculatorState";

    const defaultState = {
        product: {
            name: "",
            yieldQuantity: 0,
            yieldUnit: "pcs"
        },
        ingredients: [],
        additionalCost: 0
    };


    function loadState() {

        try {

            const saved =
                localStorage.getItem(STORAGE_KEY);

            if (!saved) {

                return JSON.parse(
                    JSON.stringify(defaultState)
                );

            }

            const parsed =
                JSON.parse(saved);

            return {

                product: {
                    ...defaultState.product,
                    ...(parsed.product || {})
                },

                ingredients:
                    Array.isArray(parsed.ingredients)
                        ? parsed.ingredients
                        : [],

                additionalCost:
                    Number(
                        parsed.additionalCost
                    ) || 0

            };

        } catch (error) {

            console.error(
                "Gagal membaca localStorage:",
                error
            );

            return JSON.parse(
                JSON.stringify(defaultState)
            );

        }

    }


    function saveState() {

        try {

            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(state)
            );

        } catch (error) {

            console.error(
                "Gagal menyimpan localStorage:",
                error
            );

        }

    }


    const state =
        loadState();

    let editingIngredientId = null;


    // ========================================
    // DOM ELEMENTS
    // ========================================

    const productDisplay =
        document.getElementById(
            "productDisplay"
        );

    const addProductButton =
        document.getElementById(
            "addProductButton"
        );

    const editProductButton =
        document.getElementById(
            "editProductButton"
        );

    const productModal =
        document.getElementById(
            "productModal"
        );

    const productModalTitle =
        document.getElementById(
            "productModalTitle"
        );

    const productNameInput =
        document.getElementById(
            "productNameInput"
        );

    const yieldQuantityInput =
        document.getElementById(
            "yieldQuantityInput"
        );

    const yieldUnitInput =
        document.getElementById(
            "yieldUnitInput"
        );

    const saveProductButton =
        document.getElementById(
            "saveProductButton"
        );


    const ingredientsDisplay =
        document.getElementById(
            "ingredientsDisplay"
        );

    const addIngredientButton =
        document.getElementById(
            "addIngredientButton"
        );

    const ingredientModal =
        document.getElementById(
            "ingredientModal"
        );

    const ingredientModalTitle =
        document.getElementById(
            "ingredientModalTitle"
        );

    const ingredientNameInput =
        document.getElementById(
            "ingredientNameInput"
        );

    const ingredientPriceInput =
        document.getElementById(
            "ingredientPriceInput"
        );

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
    // HELPERS
    // ========================================

    function formatRupiah(value) {

        const number =
            Number(value) || 0;

        return new Intl.NumberFormat(
            "id-ID",
            {
                style: "currency",
                currency: "IDR",
                maximumFractionDigits: 0
            }
        ).format(number);

    }


    function formatNumber(value) {

        const number =
            Number(value) || 0;

        return new Intl.NumberFormat(
            "id-ID",
            {
                maximumFractionDigits: 2
            }
        ).format(number);

    }


    function escapeHtml(value) {

        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

    }


    // ========================================
    // UNIT FUNCTIONS
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


    function areUnitsCompatible(
        purchaseUnit,
        usageUnit
    ) {

        const purchase =
            UNIT_DEFINITIONS[
                purchaseUnit
            ];

        const usage =
            UNIT_DEFINITIONS[
                usageUnit
            ];

        if (!purchase || !usage) {
            return false;
        }

        return (
            purchase.category ===
            usage.category
        );

    }


    // ========================================
    // CALCULATIONS
    // ========================================

    function calculateIngredientCost(
        ingredient
    ) {

        const price =
            Number(
                ingredient.purchasePrice
            ) || 0;

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


    function getTotalIngredientCost() {

        return state.ingredients.reduce(
            function (
                total,
                ingredient
            ) {

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


    function getTotalProductionCost() {

        return (
            getTotalIngredientCost() +
            Number(
                state.additionalCost || 0
            )
        );

    }


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
    // MODAL
    // ========================================

    function openModal(modal) {

        if (!modal) {
            return;
        }

        modal.classList.remove(
            "hidden"
        );

        document.body.classList.add(
            "modal-open"
        );

    }


    function closeModal(modal) {

        if (!modal) {
            return;
        }

        modal.classList.add(
            "hidden"
        );

        document.body.classList.remove(
            "modal-open"
        );

    }
        // ========================================
    // PRODUCT DISPLAY
    // ========================================

    function renderProduct() {

        if (!productDisplay) {
            return;
        }


        const hasProduct =
            state.product.name.trim() !== "";


        if (!hasProduct) {

            if (editProductButton) {

                editProductButton.style.display =
                    "none";

            }


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


            if (button) {

                button.addEventListener(
                    "click",
                    openAddProductModal
                );

            }

            return;
        }


        if (editProductButton) {

            editProductButton.style.display =
                "block";

        }


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


        const displayEditButton =
            document.getElementById(
                "productDisplayEditButton"
            );


        if (displayEditButton) {

            displayEditButton.addEventListener(
                "click",
                openEditProductModal
            );

        }

    }


    // ========================================
    // INGREDIENT DISPLAY
    // ========================================

    function renderIngredients() {

        if (!ingredientsDisplay) {
            return;
        }


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
            document.createElement(
                "div"
            );

        list.className =
            "ingredient-list";


        state.ingredients.forEach(
            function (ingredient) {

                const cost =
                    calculateIngredientCost(
                        ingredient
                    );


                const item =
                    document.createElement(
                        "div"
                    );

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


        ingredientsDisplay.innerHTML =
            "";

        ingredientsDisplay.appendChild(
            list
        );


        ingredientsDisplay
            .querySelectorAll(
                ".ingredient-edit-button"
            )
            .forEach(
                function (button) {

                    button.addEventListener(
                        "click",
                        function () {

                            openEditIngredientModal(
                                button.dataset.id
                            );

                        }
                    );

                }
            );

    }


    // ========================================
    // ADDITIONAL COST DISPLAY
    // ========================================

    function renderAdditionalCost() {

        if (!additionalCostDisplay) {
            return;
        }


        const cost =
            Number(
                state.additionalCost
            ) || 0;


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


        const editButton =
            document.getElementById(
                "editAdditionalCostButton"
            );


        if (editButton) {

            editButton.addEventListener(
                "click",
                openEditAdditionalCostModal
            );

        }

    }


    // ========================================
    // RESULTS
    // ========================================

    function renderResults() {

        const ingredientCost =
            getTotalIngredientCost();

        const additionalCost =
            Number(
                state.additionalCost
            ) || 0;

        const productionCost =
            ingredientCost +
            additionalCost;

        const hppPerUnit =
            getHppPerUnit();


        if (totalIngredientCostElement) {

            totalIngredientCostElement.textContent =
                formatRupiah(
                    ingredientCost
                );

        }


        if (totalAdditionalCostElement) {

            totalAdditionalCostElement.textContent =
                formatRupiah(
                    additionalCost
                );

        }


        if (totalProductionCostElement) {

            totalProductionCostElement.textContent =
                formatRupiah(
                    productionCost
                );

        }


        if (hppPerUnitElement) {

            hppPerUnitElement.textContent =
                formatRupiah(
                    hppPerUnit
                );

        }

    }


    // ========================================
    // RENDER APP
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

        if (!productModal) {
            return;
        }


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
            function () {

                if (productNameInput) {

                    productNameInput.focus();

                }

            },
            100
        );

    }


    function openEditProductModal() {

        if (!productModal) {
            return;
        }


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

            name: name,

            yieldQuantity:
                yieldQuantity,

            yieldUnit:
                yieldUnitInput.value

        };


        saveState();

        closeModal(
            productModal
        );

        renderApp();

    }


    // ========================================
    // INGREDIENT MODAL
    // ========================================

    function resetIngredientModal() {

        editingIngredientId = null;


        ingredientNameInput.value =
            "";

        ingredientPriceInput.value =
            "";

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


        openModal(
            ingredientModal
        );


        setTimeout(
            function () {

                if (ingredientNameInput) {

                    ingredientNameInput.focus();

                }

            },
            100
        );

    }


    function openEditIngredientModal(id) {

        const ingredient =
            state.ingredients.find(
                function (item) {

                    return (
                        String(item.id) ===
                        String(id)
                    );

                }
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


        openModal(
            ingredientModal
        );

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

            return (
                "Nama bahan belum diisi."
            );

        }


        if (data.purchasePrice <= 0) {

            return (
                "Harga beli harus lebih dari 0."
            );

        }


        if (data.purchaseQuantity <= 0) {

            return (
                "Jumlah pembelian harus lebih dari 0."
            );

        }


        if (data.usageQuantity <= 0) {

            return (
                "Jumlah penggunaan harus lebih dari 0."
            );

        }


        if (
            !areUnitsCompatible(
                data.purchaseUnit,
                data.usageUnit
            )
        ) {

            return (
                "Satuan pembelian dan penggunaan tidak kompatibel."
            );

        }


        return "";

    }
        // ========================================
    // INGREDIENT LIVE PREVIEW
    // ========================================

    function updateIngredientPreview() {

        if (!ingredientCalculationPreview) {
            return;
        }


        const data =
            getIngredientFormData();


        const error =
            validateIngredient(data);


        if (error) {

            ingredientCalculationPreview.innerHTML =
                "Biaya bahan: <strong>Rp0</strong>";

            return;

        }


        const cost =
            calculateIngredientCost(
                data
            );


        ingredientCalculationPreview.innerHTML = `

            Biaya bahan:
            <strong>
                ${formatRupiah(cost)}
            </strong>

        `;

    }


    // ========================================
    // SAVE INGREDIENT
    // ========================================

    function saveIngredient() {

        const data =
            getIngredientFormData();


        const error =
            validateIngredient(data);


        if (error) {

            ingredientValidationMessage.textContent =
                error;

            ingredientValidationMessage.classList.remove(
                "hidden"
            );

            return;

        }


        ingredientValidationMessage.textContent =
            "";

        ingredientValidationMessage.classList.add(
            "hidden"
        );


        if (
            editingIngredientId !== null
        ) {

            const index =
                state.ingredients.findIndex(
                    function (item) {

                        return (
                            String(item.id) ===
                            String(
                                editingIngredientId
                            )
                        );

                    }
                );


            if (index !== -1) {

                state.ingredients[index] = {

                    id:
                        state.ingredients[index].id,

                    name:
                        data.name,

                    purchasePrice:
                        data.purchasePrice,

                    purchaseQuantity:
                        data.purchaseQuantity,

                    purchaseUnit:
                        data.purchaseUnit,

                    usageQuantity:
                        data.usageQuantity,

                    usageUnit:
                        data.usageUnit

                };

            }

        } else {

            state.ingredients.push({

                id:
                    Date.now(),

                name:
                    data.name,

                purchasePrice:
                    data.purchasePrice,

                purchaseQuantity:
                    data.purchaseQuantity,

                purchaseUnit:
                    data.purchaseUnit,

                usageQuantity:
                    data.usageQuantity,

                usageUnit:
                    data.usageUnit

            });

        }


        saveState();


        closeModal(
            ingredientModal
        );


        editingIngredientId =
            null;


        renderApp();

    }


    // ========================================
    // DELETE INGREDIENT
    // ========================================

    function deleteCurrentIngredient() {

        if (
            editingIngredientId === null
        ) {

            return;

        }


        const ingredient =
            state.ingredients.find(
                function (item) {

                    return (
                        String(item.id) ===
                        String(
                            editingIngredientId
                        )
                    );

                }
            );


        if (!ingredient) {
            return;
        }


        const confirmed =
            confirm(
                "Hapus bahan " +
                ingredient.name +
                "?"
            );


        if (!confirmed) {
            return;
        }


        state.ingredients =
            state.ingredients.filter(
                function (item) {

                    return (
                        String(item.id) !==
                        String(
                            editingIngredientId
                        )
                    );

                }
            );


        editingIngredientId =
            null;


        saveState();


        closeModal(
            ingredientModal
        );


        renderApp();

    }


    // ========================================
    // ADDITIONAL COST MODAL
    // ========================================

    function openAddAdditionalCostModal() {

        if (!additionalCostModal) {
            return;
        }


        additionalCostInput.value =
            state.additionalCost || "";


        openModal(
            additionalCostModal
        );


        setTimeout(
            function () {

                if (additionalCostInput) {

                    additionalCostInput.focus();

                }

            },
            100
        );

    }


    function openEditAdditionalCostModal() {

        if (!additionalCostModal) {
            return;
        }


        additionalCostInput.value =
            state.additionalCost || "";


        openModal(
            additionalCostModal
        );

    }


    function saveAdditionalCost() {

        const value =
            Number(
                additionalCostInput.value
            ) || 0;


        if (value < 0) {

            alert(
                "Biaya tambahan tidak boleh negatif."
            );

            return;

        }


        state.additionalCost =
            value;


        saveState();


        closeModal(
            additionalCostModal
        );


        renderApp();

    }


    // ========================================
    // MODAL CLOSE BUTTONS
    // ========================================

    document
        .querySelectorAll(
            "[data-close-modal]"
        )
        .forEach(
            function (button) {

                button.addEventListener(
                    "click",
                    function () {

                        const modalId =
                            button.getAttribute(
                                "data-close-modal"
                            );


                        const modal =
                            document.getElementById(
                                modalId
                            );


                        closeModal(
                            modal
                        );

                    }
                );

            }
        );


    // ========================================
    // MODAL OVERLAY
    // ========================================

    document
        .querySelectorAll(
            ".modal-overlay"
        )
        .forEach(
            function (overlay) {

                overlay.addEventListener(
                    "click",
                    function () {

                        const modal =
                            overlay.closest(
                                ".modal"
                            );


                        closeModal(
                            modal
                        );

                    }
                );

            }
        );


    // ========================================
    // ESC KEY
    // ========================================

    document.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key !==
                "Escape"
            ) {

                return;

            }


            document
                .querySelectorAll(
                    ".modal:not(.hidden)"
                )
                .forEach(
                    function (modal) {

                        closeModal(
                            modal
                        );

                    }
                );

        }
    );


    // ========================================
    // PRODUCT EVENTS
    // ========================================

    if (addProductButton) {

        addProductButton.addEventListener(
            "click",
            openAddProductModal
        );

    }


    if (editProductButton) {

        editProductButton.addEventListener(
            "click",
            openEditProductModal
        );

    }


    if (saveProductButton) {

        saveProductButton.addEventListener(
            "click",
            saveProduct
        );

    }


    // ========================================
    // INGREDIENT EVENTS
    // ========================================

    if (addIngredientButton) {

        addIngredientButton.addEventListener(
            "click",
            openAddIngredientModal
        );

    }


    if (saveIngredientButton) {

        saveIngredientButton.addEventListener(
            "click",
            saveIngredient
        );

    }


    if (deleteIngredientButton) {

        deleteIngredientButton.addEventListener(
            "click",
            deleteCurrentIngredient
        );

    }


    // ========================================
    // INGREDIENT LIVE CALCULATION EVENTS
    // ========================================

    const ingredientInputs = [

        ingredientPriceInput,

        ingredientPurchaseQuantityInput,

        ingredientPurchaseUnitInput,

        ingredientUsageQuantityInput,

        ingredientUsageUnitInput

    ];


    ingredientInputs.forEach(
        function (input) {

            if (!input) {
                return;
            }


            input.addEventListener(
                "input",
                updateIngredientPreview
            );


            input.addEventListener(
                "change",
                updateIngredientPreview
            );

        }
    );
        // ========================================
    // ADDITIONAL COST EVENTS
    // ========================================

    if (addAdditionalCostButton) {

        addAdditionalCostButton.addEventListener(
            "click",
            openAddAdditionalCostModal
        );

    }


    if (saveAdditionalCostButton) {

        saveAdditionalCostButton.addEventListener(
            "click",
            saveAdditionalCost
        );

    }


    // ========================================
    // INITIAL RENDER
    // ========================================

    renderApp();

});
