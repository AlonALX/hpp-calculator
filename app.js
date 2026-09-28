// ========================================
// HPP CALCULATOR
// Display + Modal + LocalStorage
// ========================================

document.addEventListener("DOMContentLoaded", function () {

    // ========================================
    // STORAGE
    // ========================================

    const STORAGE_KEY = "hppCalculatorState";

    // Tarif acuan listrik UMKM yang digunakan aplikasi.
    // User memilih golongan; tarif otomatis diambil dari daftar ini.
    // Acuan tarif: PLN/ESDM Q3 2026 (Juli-September 2026).
    const ELECTRICITY_TARIFF_OPTIONS = [
        {
            id: "R1_450_SUBSIDIZED",
            group: "R",
            label: "R-1/TR — 450 VA (Subsidi)",
            tariff: 415
        },
        {
            id: "R1_900_SUBSIDIZED",
            group: "R",
            label: "R-1/TR — 900 VA (Subsidi)",
            tariff: 605
        },
        {
            id: "R1_900_NON_SUBSIDIZED",
            group: "R",
            label: "R-1/TR — 900 VA (Nonsubsidi)",
            tariff: 1352
        },
        {
            id: "R1_1300",
            group: "R",
            label: "R-1/TR — 1.300 VA",
            tariff: 1444.70
        },
        {
            id: "R1_2200",
            group: "R",
            label: "R-1/TR — 2.200 VA",
            tariff: 1444.70
        },
        {
            id: "R2_3500_5500",
            group: "R",
            label: "R-2/TR — 3.500–5.500 VA",
            tariff: 1699.53
        },
        {
            id: "R3_6600_PLUS",
            group: "R",
            label: "R-3/TR — ≥6.600 VA",
            tariff: 1699.53
        },
        {
            id: "B1_1300",
            group: "B",
            label: "B-1/TR — 1.300 VA",
            tariff: 966
        },
        {
            id: "B1_2200_5500",
            group: "B",
            label: "B-1/TR — 2.200–5.500 VA",
            tariff: 1100
        },
        {
            id: "B2_6600_200K",
            group: "B",
            label: "B-2/TR — 6.600 VA–200 kVA",
            tariff: 1444.70
        }
    ];

    const DEFAULT_ELECTRICITY_CLASS = "R1_1300";

    // Mengambil tarif berdasarkan ID golongan listrik.
    function getElectricityTariff(classId) {
        const option = ELECTRICITY_TARIFF_OPTIONS.find(function (item) {
            return item.id === classId;
        });

        return option
            ? option.tariff
            : ELECTRICITY_TARIFF_OPTIONS.find(function (item) {
                return item.id === DEFAULT_ELECTRICITY_CLASS;
            }).tariff;
    }

    // Mengambil ID golongan dari tarif lama agar data localStorage versi sebelumnya tetap terbaca.
    function inferElectricityClass(tariff) {
        const numericTariff = Number(tariff);

        const option = ELECTRICITY_TARIFF_OPTIONS.find(function (item) {
            return Math.abs(item.tariff - numericTariff) < 0.01;
        });

        return option ? option.id : DEFAULT_ELECTRICITY_CLASS;
    }

    const defaultState = {
    product: {
        name: "",
        yieldQuantity: 0,
        yieldUnit: "pcs"
    },
    ingredients: [],
    additionalCosts: {
        mode: "simple",
        simple: {
            total: 0
        },
        detailed: {
            gas: null,
            electricity: null,
            packaging: null,
            labor: null
        }
    }
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

        /*
         * Backward compatibility:
         * Versi lama menggunakan:
         *
         * additionalCost: 10000
         *
         * Nilai tersebut dipindahkan
         * menjadi Simple Mode.
         */
        let additionalCosts;

        if (
            parsed.additionalCosts &&
            typeof parsed.additionalCosts === "object"
        ) {

            additionalCosts = {

                mode:
                    parsed.additionalCosts.mode === "detailed"
                        ? "detailed"
                        : "simple",

                simple: {

                    total:
                        Number(
                            parsed.additionalCosts.simple?.total
                        ) || 0

                },

                detailed: {

                    gas:
                        parsed.additionalCosts.detailed?.gas || null,

                    electricity:
                        parsed.additionalCosts.detailed?.electricity || null,

                    packaging:
                        parsed.additionalCosts.detailed?.packaging || null,

                    labor:
                        parsed.additionalCosts.detailed?.labor || null

                }

            };

        } else {

            /*
             * Migrate data dari versi lama.
             */
            additionalCosts = {

                mode: "simple",

                simple: {

                    total:
                        Number(
                            parsed.additionalCost
                        ) || 0

                },

                detailed: {

                    gas: null,

                    electricity: null,

                    packaging: null,

                    labor: null

                }

            };

        }

        return {

            product: {

                ...defaultState.product,

                ...(parsed.product || {})

            },

            ingredients:
                Array.isArray(parsed.ingredients)
                    ? parsed.ingredients
                    : [],

            additionalCosts:
                additionalCosts

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

    // Menjamin struktur Detailed selalu lengkap untuk data lama/localStorage lama.
    state.additionalCosts = state.additionalCosts || {};
    state.additionalCosts.mode =
        state.additionalCosts.mode === "detailed"
            ? "detailed"
            : "simple";
    state.additionalCosts.simple =
        state.additionalCosts.simple || { total: 0 };
    state.additionalCosts.detailed =
        state.additionalCosts.detailed || {};
    state.additionalCosts.detailed.gas =
        state.additionalCosts.detailed.gas || null;
    state.additionalCosts.detailed.electricity =
        Array.isArray(state.additionalCosts.detailed.electricity)
            ? state.additionalCosts.detailed.electricity
            : [];
    state.additionalCosts.detailed.packaging =
        Array.isArray(state.additionalCosts.detailed.packaging)
            ? state.additionalCosts.detailed.packaging
            : [];
    state.additionalCosts.detailed.labor =
        state.additionalCosts.detailed.labor || null;

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

    const additionalCostModeInput =
        document.getElementById(
            "additionalCostModeInput"
        );

    const simpleAdditionalCostFields =
        document.getElementById(
            "simpleAdditionalCostFields"
        );

    const detailedAdditionalCostFields =
        document.getElementById(
            "detailedAdditionalCostFields"
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


    // Menghitung total biaya gas berdasarkan harga tabung dan jam pemakaian.
    function calculateGasCost(gas) {

        if (!gas) {
            return 0;
        }

        const price = Number(gas.purchasePrice) || 0;
        const totalHours = Number(gas.totalHours) || 0;
        const usageHours = Number(gas.usageHours) || 0;

        if (price <= 0 || totalHours <= 0 || usageHours <= 0) {
            return 0;
        }

        return (price / totalHours) * usageHours;

    }


    // Menghitung biaya listrik satu peralatan berdasarkan watt, durasi, dan tarif kWh.
    function calculateElectricityCost(item) {

        if (!item) {
            return 0;
        }

        const watt = Number(item.watt) || 0;
        const hours = Number(item.durationHours) || 0;
        const tariff = Number(item.tariffPerKwh) || 0;

        if (watt <= 0 || hours <= 0 || tariff < 0) {
            return 0;
        }

        return (watt / 1000) * hours * tariff;

    }


    // Menghitung biaya kemasan, baik harga per unit maupun harga per paket.
    function calculatePackagingCost(item) {

        if (!item) {
            return 0;
        }

        const quantity = Number(item.quantityUsed) || 0;
        const mode = item.mode === "per_package" ? "per_package" : "per_unit";

        if (quantity <= 0) {
            return 0;
        }

        if (mode === "per_unit") {

            const unitPrice = Number(item.unitPrice) || 0;

            return unitPrice > 0 ? unitPrice * quantity : 0;

        }

        const packagePrice = Number(item.packagePrice) || 0;
        const unitsPerPackage = Number(item.unitsPerPackage) || 0;

        if (packagePrice <= 0 || unitsPerPackage <= 0) {
            return 0;
        }

        return Math.ceil(quantity / unitsPerPackage) * packagePrice;

    }


    // Menghitung biaya tenaga kerja berdasarkan upah harian dan durasi resep.
    function calculateLaborCost(labor) {

        if (!labor) {
            return 0;
        }

        const dailyWage = Number(labor.dailyWage) || 0;
        const hoursPerDay = Number(labor.hoursPerDay) || 0;
        const recipeHours = Number(labor.recipeHours) || 0;

        if (dailyWage <= 0 || hoursPerDay <= 0 || recipeHours <= 0) {
            return 0;
        }

        return (dailyWage / hoursPerDay) * recipeHours;

    }


    // Mengambil rincian biaya Detailed beserta total masing-masing komponen.
    function getDetailedCostBreakdown() {

        const detailed =
            state.additionalCosts?.detailed || {};

        const gas =
            calculateGasCost(detailed.gas);

        const electricity =
            Array.isArray(detailed.electricity)
                ? detailed.electricity.reduce(
                    function (total, item) {
                        return total + calculateElectricityCost(item);
                    },
                    0
                )
                : 0;

        const packaging =
            Array.isArray(detailed.packaging)
                ? detailed.packaging.reduce(
                    function (total, item) {
                        return total + calculatePackagingCost(item);
                    },
                    0
                )
                : 0;

        const labor =
            calculateLaborCost(detailed.labor);

        return {
            gas,
            electricity,
            packaging,
            labor,
            total: gas + electricity + packaging + labor
        };

    }


    // Mengambil biaya tambahan yang aktif. Mode Simple dan Detailed tidak pernah dijumlahkan.
    function getActiveAdditionalCost() {

        const additionalCosts =
            state.additionalCosts;

        if (!additionalCosts) {
            return 0;
        }

        if (additionalCosts.mode === "detailed") {
            return getDetailedCostBreakdown().total;
        }

        return Number(
            additionalCosts.simple?.total
        ) || 0;

    }


    // Menghitung total biaya produksi = total bahan + biaya tambahan aktif.
    function getTotalProductionCost() {

        return (
            getTotalIngredientCost() +
            getActiveAdditionalCost()
        );

    }


    // Menghitung HPP per unit berdasarkan jumlah hasil produksi.
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

    // Menampilkan ringkasan biaya tambahan aktif di halaman utama.
    function renderAdditionalCost() {

        if (!additionalCostDisplay) {
            return;
        }

        const additionalCosts = state.additionalCosts;

        const simpleTotal =
            Number(additionalCosts.simple?.total) || 0;

        const breakdown = getDetailedCostBreakdown();

        if (additionalCosts.mode === "simple") {

            if (simpleTotal <= 0) {

                additionalCostDisplay.innerHTML = `
                    <div class="empty-state compact">
                        <strong>Belum ada biaya tambahan</strong>
                        <p>Tambahkan biaya tambahan untuk menghitung HPP.</p>
                    </div>
                `;

                return;
            }

            additionalCostDisplay.innerHTML = `
                <div class="cost-mode-card">
                    <div>
                        <div class="ingredient-name-display">Simple</div>
                        <div class="ingredient-usage-display">Total biaya tambahan</div>
                        <div class="ingredient-cost-display">${formatRupiah(simpleTotal)}</div>
                    </div>
                    <button type="button" class="edit-text-button" id="editAdditionalCostButton">Edit</button>
                </div>
            `;

        } else {

            const rows = [];

            if (breakdown.gas > 0) {
                rows.push(`
                    <div class="detailed-summary-row">
                        <span>Gas</span>
                        <strong>${formatRupiah(breakdown.gas)}</strong>
                    </div>
                `);
            }

            if (breakdown.electricity > 0) {
                rows.push(`
                    <div class="detailed-summary-row">
                        <span>Listrik</span>
                        <strong>${formatRupiah(breakdown.electricity)}</strong>
                    </div>
                `);
            }

            if (breakdown.packaging > 0) {
                rows.push(`
                    <div class="detailed-summary-row">
                        <span>Kemasan</span>
                        <strong>${formatRupiah(breakdown.packaging)}</strong>
                    </div>
                `);
            }

            if (breakdown.labor > 0) {
                rows.push(`
                    <div class="detailed-summary-row">
                        <span>Tenaga Kerja</span>
                        <strong>${formatRupiah(breakdown.labor)}</strong>
                    </div>
                `);
            }

            additionalCostDisplay.innerHTML = `
                <div class="detailed-summary-card">
                    <div class="detailed-summary-header">
                        <div>
                            <div class="ingredient-name-display">Detailed / Guided</div>
                            <div class="ingredient-usage-display">Rincian biaya produksi</div>
                        </div>
                        <button type="button" class="edit-text-button" id="editAdditionalCostButton">Edit</button>
                    </div>
                    <div class="detailed-summary-list">
                        ${rows.length ? rows.join("") : '<div class="helper-text">Belum ada komponen biaya.</div>'}
                    </div>
                    <div class="detailed-summary-total">
                        <span>Total Biaya Tambahan</span>
                        <strong>${formatRupiah(breakdown.total)}</strong>
                    </div>
                </div>
            `;

        }

        const editButton =
            document.getElementById("editAdditionalCostButton");

        if (editButton) {
            editButton.addEventListener("click", openEditAdditionalCostModal);
        }

    }


    // ========================================
    // RESULTS
    // ========================================

    function renderResults() {

    const ingredientCost =
        getTotalIngredientCost();

    const additionalCost =
        getActiveAdditionalCost();

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

    // Membuka modal biaya tambahan dalam mode yang terakhir aktif.
    function openAddAdditionalCostModal() {

        if (!additionalCostModal) {
            return;
        }

        prepareAdditionalCostModal();

        openModal(
            additionalCostModal
        );

    }


    // Membuka modal edit dengan data Simple/Detailed yang tersimpan.
    function openEditAdditionalCostModal() {

        if (!additionalCostModal) {
            return;
        }

        prepareAdditionalCostModal();

        openModal(
            additionalCostModal
        );

    }


    // Menyiapkan isi modal dan memilih mode aktif tanpa menghapus mode lain.
    function prepareAdditionalCostModal() {

        const mode =
            state.additionalCosts.mode === "detailed"
                ? "detailed"
                : "simple";

        if (additionalCostModeInput) {
            additionalCostModeInput.value = mode;
        }

        if (additionalCostInput) {
            additionalCostInput.value =
                Number(state.additionalCosts.simple?.total) || "";
        }

        updateAdditionalCostModeUI();

    }


    // Mengubah tampilan Simple/Detailed sesuai pilihan user.
    function updateAdditionalCostModeUI() {

        if (!additionalCostModeInput) {
            return;
        }

        const mode = additionalCostModeInput.value === "detailed"
            ? "detailed"
            : "simple";

        if (simpleAdditionalCostFields) {
            simpleAdditionalCostFields.classList.toggle(
                "hidden",
                mode !== "simple"
            );
        }

        if (detailedAdditionalCostFields) {
            detailedAdditionalCostFields.classList.toggle(
                "hidden",
                mode !== "detailed"
            );
        }

        if (mode === "detailed") {
            renderDetailedCostEditor();
        }

    }


    // Menampilkan daftar komponen Detailed dan form untuk menambah/mengedit komponen.
    function renderDetailedCostEditor(editType = null, editIndex = null) {

        if (!detailedAdditionalCostFields) {
            return;
        }

        const detailed =
            state.additionalCosts.detailed;

        detailedAdditionalCostFields.innerHTML = `
            <div class="detailed-editor">
                <div class="detailed-component-list">
                    ${renderDetailedComponentRows()}
                </div>

                <div class="form-group detailed-add-form-group">
                    <label for="detailedCostTypeInput">Tambah komponen biaya</label>
                    <select id="detailedCostTypeInput">
                        <option value="gas">Gas</option>
                        <option value="electricity">Listrik</option>
                        <option value="packaging">Kemasan</option>
                        <option value="labor">Tenaga Kerja</option>
                    </select>
                </div>

                <div id="detailedComponentForm"></div>

                <button
                    type="button"
                    id="saveDetailedComponentButton"
                    class="button primary detailed-save-component-button"
                >
                    ${editType ? "Simpan Perubahan" : "Tambah Komponen"}
                </button>

                <div class="detailed-total-preview">
                    <span>Total Biaya Tambahan</span>
                    <strong>${formatRupiah(getDetailedCostBreakdown().total)}</strong>
                </div>

                <button
                    type="button"
                    id="switchToSimpleButton"
                    class="button secondary detailed-switch-button"
                >
                    Ganti ke Simple
                </button>
            </div>
        `;

        const typeInput =
            document.getElementById("detailedCostTypeInput");

        if (typeInput && editType) {
            typeInput.value = editType;
        }

        renderDetailedComponentForm(
            editType || (typeInput ? typeInput.value : "gas"),
            editIndex
        );

        if (typeInput) {
            typeInput.addEventListener(
                "change",
                function () {
                    renderDetailedComponentForm(
                        typeInput.value,
                        null
                    );
                }
            );
        }

        const saveButton =
            document.getElementById("saveDetailedComponentButton");

        if (saveButton) {
            saveButton.addEventListener(
                "click",
                function () {
                    saveDetailedComponent(
                        typeInput ? typeInput.value : "gas",
                        editIndex
                    );
                }
            );
        }

        const switchButton =
            document.getElementById("switchToSimpleButton");

        if (switchButton) {
            switchButton.addEventListener(
                "click",
                function () {
                    if (additionalCostModeInput) {
                        additionalCostModeInput.value = "simple";
                    }
                    updateAdditionalCostModeUI();
                }
            );
        }

        detailedAdditionalCostFields
            .querySelectorAll("[data-detailed-edit]")
            .forEach(
                function (button) {
                    button.addEventListener(
                        "click",
                        function () {
                            renderDetailedCostEditor(
                                button.dataset.detailedEdit,
                                button.dataset.detailedIndex === ""
                                    ? null
                                    : Number(button.dataset.detailedIndex)
                            );
                        }
                    );
                }
            );

        detailedAdditionalCostFields
            .querySelectorAll("[data-detailed-delete]")
            .forEach(
                function (button) {
                    button.addEventListener(
                        "click",
                        function () {
                            deleteDetailedComponent(
                                button.dataset.detailedDelete,
                                button.dataset.detailedIndex === ""
                                    ? null
                                    : Number(button.dataset.detailedIndex)
                            );
                        }
                    );
                }
            );

    }


    // Membuat baris ringkasan untuk setiap komponen Detailed yang sudah tersimpan.
    function renderDetailedComponentRows() {

        const detailed =
            state.additionalCosts.detailed;

        const rows = [];

        if (detailed.gas) {
            const cost = calculateGasCost(detailed.gas);
            rows.push(`
                <div class="detailed-component-card">
                    <div>
                        <strong>Gas</strong>
                        <div class="helper-text">${formatRupiah(cost)}</div>
                    </div>
                    <div class="detailed-component-actions">
                        <button type="button" class="edit-text-button" data-detailed-edit="gas" data-detailed-index="">Edit</button>
                        <button type="button" class="edit-text-button danger-text" data-detailed-delete="gas" data-detailed-index="">Hapus</button>
                    </div>
                </div>
            `);
        }

        detailed.electricity.forEach(
            function (item, index) {
                rows.push(`
                    <div class="detailed-component-card">
                        <div>
                            <strong>Listrik</strong>
                            <div class="helper-text">${escapeHtml(item.applianceName || "Peralatan")} · ${formatRupiah(calculateElectricityCost(item))}</div>
                        </div>
                        <div class="detailed-component-actions">
                            <button type="button" class="edit-text-button" data-detailed-edit="electricity" data-detailed-index="${index}">Edit</button>
                            <button type="button" class="edit-text-button danger-text" data-detailed-delete="electricity" data-detailed-index="${index}">Hapus</button>
                        </div>
                    </div>
                `);
            }
        );

        detailed.packaging.forEach(
            function (item, index) {
                rows.push(`
                    <div class="detailed-component-card">
                        <div>
                            <strong>Kemasan</strong>
                            <div class="helper-text">${escapeHtml(item.name || "Kemasan")} · ${formatRupiah(calculatePackagingCost(item))}</div>
                        </div>
                        <div class="detailed-component-actions">
                            <button type="button" class="edit-text-button" data-detailed-edit="packaging" data-detailed-index="${index}">Edit</button>
                            <button type="button" class="edit-text-button danger-text" data-detailed-delete="packaging" data-detailed-index="${index}">Hapus</button>
                        </div>
                    </div>
                `);
            }
        );

        if (detailed.labor) {
            const cost = calculateLaborCost(detailed.labor);
            rows.push(`
                <div class="detailed-component-card">
                    <div>
                        <strong>Tenaga Kerja</strong>
                        <div class="helper-text">${formatRupiah(cost)}</div>
                    </div>
                    <div class="detailed-component-actions">
                        <button type="button" class="edit-text-button" data-detailed-edit="labor" data-detailed-index="">Edit</button>
                        <button type="button" class="edit-text-button danger-text" data-detailed-delete="labor" data-detailed-index="">Hapus</button>
                    </div>
                </div>
            `);
        }

        return rows.length
            ? rows.join("")
            : '<div class="detailed-empty-state">Belum ada komponen biaya. Tambahkan Gas, Listrik, Kemasan, atau Tenaga Kerja.</div>';

    }


    // Menampilkan field input sesuai jenis komponen Detailed yang dipilih.
    function renderDetailedComponentForm(type, editIndex = null) {

        const container =
            document.getElementById("detailedComponentForm");

        if (!container) {
            return;
        }

        const detailed =
            state.additionalCosts.detailed;

        let data = null;

        if (type === "gas") {
            data = detailed.gas;
        } else if (type === "electricity" && editIndex !== null) {
            data = detailed.electricity[editIndex] || null;
        } else if (type === "packaging" && editIndex !== null) {
            data = detailed.packaging[editIndex] || null;
        } else if (type === "labor") {
            data = detailed.labor;
        }

        const value = function (key, fallback = "") {
            return data && data[key] !== undefined
                ? data[key]
                : fallback;
        };

        if (type === "gas") {
            container.innerHTML = `
                <div class="detailed-form-box">
                    <div class="form-group">
                        <label for="gasCylinderTypeInput">Jenis tabung</label>
                        <select id="gasCylinderTypeInput">
                            <option value="3 kg">3 kg</option>
                            <option value="5.5 kg">5,5 kg</option>
                            <option value="12 kg">12 kg</option>
                            <option value="custom">Lainnya</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="gasPurchasePriceInput">Harga tabung / isi ulang</label>
                        <input type="number" id="gasPurchasePriceInput" min="0" step="any" inputmode="decimal" value="${value("purchasePrice")}" placeholder="Contoh: 22000">
                    </div>
                    <div class="form-group">
                        <label for="gasTotalHoursInput">Estimasi total pemakaian (jam)</label>
                        <input type="number" id="gasTotalHoursInput" min="0.01" step="any" inputmode="decimal" value="${value("totalHours")}" placeholder="Contoh: 20">
                    </div>
                    <div class="form-group">
                        <label for="gasUsageHoursInput">Pemakaian untuk resep (jam)</label>
                        <input type="number" id="gasUsageHoursInput" min="0.01" step="any" inputmode="decimal" value="${value("usageHours")}" placeholder="Contoh: 1.5">
                    </div>
                    <div class="calculation-preview" id="detailedCalculationPreview">Biaya gas: <strong>${formatRupiah(calculateGasCost(data))}</strong></div>
                </div>
            `;
            const select = document.getElementById("gasCylinderTypeInput");
            if (select && value("cylinderType")) {
                select.value = value("cylinderType");
            }
            return;
        }

        if (type === "electricity") {
            const selectedClass = value(
                "electricityClass",
                inferElectricityClass(value("tariffPerKwh", getElectricityTariff(DEFAULT_ELECTRICITY_CLASS)))
            );
            const selectedTariff = getElectricityTariff(selectedClass);

            container.innerHTML = `
                <div class="detailed-form-box">
                    <div class="form-group">
                        <label for="electricityApplianceInput">Nama peralatan</label>
                        <input type="text" id="electricityApplianceInput" value="${escapeHtml(value("applianceName"))}" placeholder="Contoh: Oven">
                    </div>
                    <div class="form-group">
                        <label for="electricityWattInput">Daya (Watt)</label>
                        <input type="number" id="electricityWattInput" min="0" step="any" inputmode="decimal" value="${value("watt")}" placeholder="Contoh: 800">
                    </div>
                    <div class="form-group">
                        <label for="electricityDurationInput">Durasi pemakaian (jam)</label>
                        <input type="number" id="electricityDurationInput" min="0" step="any" inputmode="decimal" value="${value("durationHours")}" placeholder="Contoh: 1.5">
                    </div>
                    <div class="form-group">
                        <label for="electricityClassInput">Golongan listrik</label>
                        <select id="electricityClassInput">
                            <optgroup label="Rumah Tangga (R)">
                                ${ELECTRICITY_TARIFF_OPTIONS.filter(function (option) { return option.group === "R"; }).map(function (option) {
                                    return `<option value="${option.id}" ${option.id === selectedClass ? "selected" : ""}>${option.label}</option>`;
                                }).join("")}
                            </optgroup>
                            <optgroup label="Bisnis (B)">
                                ${ELECTRICITY_TARIFF_OPTIONS.filter(function (option) { return option.group === "B"; }).map(function (option) {
                                    return `<option value="${option.id}" ${option.id === selectedClass ? "selected" : ""}>${option.label}</option>`;
                                }).join("")}
                            </optgroup>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="electricityTariffInput">Tarif yang digunakan</label>
                        <input type="text" id="electricityTariffInput" value="${formatRupiah(selectedTariff)}/kWh" readonly aria-readonly="true">
                        <div class="helper-text">Tarif acuan aplikasi: Juli–September 2026. Jika tarif PLN berubah, beri tahu kami agar tarif aplikasi dapat diperbarui.</div>
                    </div>
                    <div class="calculation-preview">Biaya listrik: <strong>${formatRupiah(calculateElectricityCost({ ...data, tariffPerKwh: selectedTariff }))}</strong></div>
                </div>
            `;

            const classInput = document.getElementById("electricityClassInput");
            const tariffInput = document.getElementById("electricityTariffInput");

            if (classInput) {
                classInput.addEventListener("change", function () {
                    const tariff = getElectricityTariff(classInput.value);

                    if (tariffInput) {
                        tariffInput.value = `${formatRupiah(tariff)}/kWh`;
                    }

                    const preview = container.querySelector(".calculation-preview strong");
                    if (preview) {
                        preview.textContent = formatRupiah(
                            calculateElectricityCost({ ...data, tariffPerKwh: tariff })
                        );
                    }
                });
            }

            return;
        }

        if (type === "packaging") {
            const mode = value("mode", "per_unit");
            container.innerHTML = `
                <div class="detailed-form-box">
                    <div class="form-group">
                        <label for="packagingNameInput">Nama kemasan</label>
                        <input type="text" id="packagingNameInput" value="${escapeHtml(value("name"))}" placeholder="Contoh: Box brownies">
                    </div>
                    <div class="form-group">
                        <label for="packagingModeInput">Cara menghitung</label>
                        <select id="packagingModeInput">
                            <option value="per_unit">Harga per unit</option>
                            <option value="per_package">Harga per paket</option>
                        </select>
                    </div>
                    <div id="packagingDynamicFields"></div>
                </div>
            `;
            const modeInput = document.getElementById("packagingModeInput");
            if (modeInput) {
                modeInput.value = mode;
                renderPackagingDynamicFields(data);
                modeInput.addEventListener("change", function () {
                    renderPackagingDynamicFields(data);
                });
            }
            return;
        }

        if (type === "labor") {
            container.innerHTML = `
                <div class="detailed-form-box">
                    <div class="form-group">
                        <label for="laborDailyWageInput">Upah per hari</label>
                        <input type="number" id="laborDailyWageInput" min="0" step="any" inputmode="decimal" value="${value("dailyWage")}" placeholder="Contoh: 100000">
                    </div>
                    <div class="form-group">
                        <label for="laborHoursPerDayInput">Jam kerja per hari</label>
                        <input type="number" id="laborHoursPerDayInput" min="0.01" step="any" inputmode="decimal" value="${value("hoursPerDay")}" placeholder="Contoh: 8">
                    </div>
                    <div class="form-group">
                        <label for="laborRecipeHoursInput">Durasi pengerjaan resep (jam)</label>
                        <input type="number" id="laborRecipeHoursInput" min="0" step="any" inputmode="decimal" value="${value("recipeHours")}" placeholder="Contoh: 2">
                    </div>
                    <div class="calculation-preview">Biaya tenaga kerja: <strong>${formatRupiah(calculateLaborCost(data))}</strong></div>
                </div>
            `;
        }

    }


    // Membuat field kemasan berdasarkan pilihan harga per unit atau per paket.
    function renderPackagingDynamicFields(data) {

        const container =
            document.getElementById("packagingDynamicFields");

        const modeInput =
            document.getElementById("packagingModeInput");

        if (!container || !modeInput) {
            return;
        }

        const mode = modeInput.value;
        const old = data || {};

        if (mode === "per_package") {
            container.innerHTML = `
                <div class="form-group">
                    <label for="packagingPackagePriceInput">Harga per paket</label>
                    <input type="number" id="packagingPackagePriceInput" min="0" step="any" inputmode="decimal" value="${old.packagePrice || ""}" placeholder="Contoh: 50000">
                </div>
                <div class="form-group">
                    <label for="packagingUnitsPerPackageInput">Isi per paket</label>
                    <input type="number" id="packagingUnitsPerPackageInput" min="1" step="1" inputmode="numeric" value="${old.unitsPerPackage || ""}" placeholder="Contoh: 50">
                </div>
            `;
        } else {
            container.innerHTML = `
                <div class="form-group">
                    <label for="packagingUnitPriceInput">Harga per unit</label>
                    <input type="number" id="packagingUnitPriceInput" min="0" step="any" inputmode="decimal" value="${old.unitPrice || ""}" placeholder="Contoh: 1000">
                </div>
            `;
        }

        container.insertAdjacentHTML(
            "beforeend",
            `
                <div class="form-group">
                    <label for="packagingQuantityInput">Jumlah kemasan yang digunakan</label>
                    <input type="number" id="packagingQuantityInput" min="0" step="any" inputmode="decimal" value="${old.quantityUsed || ""}" placeholder="Contoh: 20">
                </div>
            `
        );

    }


    // Membaca field komponen Detailed dan menyimpannya ke state tanpa menghapus komponen lain.
    function saveDetailedComponent(type, editIndex = null) {

        const detailed =
            state.additionalCosts.detailed;

        let item = null;

        if (type === "gas") {
            item = {
                cylinderType: document.getElementById("gasCylinderTypeInput")?.value || "3 kg",
                purchasePrice: Number(document.getElementById("gasPurchasePriceInput")?.value) || 0,
                totalHours: Number(document.getElementById("gasTotalHoursInput")?.value) || 0,
                usageHours: Number(document.getElementById("gasUsageHoursInput")?.value) || 0
            };

            if (item.purchasePrice <= 0 || item.totalHours <= 0 || item.usageHours <= 0) {
                alert("Lengkapi harga tabung, estimasi total jam, dan jam pemakaian resep.");
                return;
            }

            detailed.gas = item;

        } else if (type === "electricity") {
            const electricityClass =
                document.getElementById("electricityClassInput")?.value || DEFAULT_ELECTRICITY_CLASS;

            const tariffPerKwh = getElectricityTariff(electricityClass);

            item = {
                applianceName: document.getElementById("electricityApplianceInput")?.value.trim() || "Peralatan listrik",
                watt: Number(document.getElementById("electricityWattInput")?.value) || 0,
                durationHours: Number(document.getElementById("electricityDurationInput")?.value) || 0,
                electricityClass,
                tariffPerKwh
            };

            if (item.watt <= 0 || item.durationHours <= 0 || item.tariffPerKwh <= 0) {
                alert("Lengkapi nama peralatan, daya, dan durasi pemakaian.");
                return;
            }

            if (editIndex === null || editIndex === undefined || !Number.isInteger(editIndex)) {
                detailed.electricity.push(item);
            } else {
                detailed.electricity[editIndex] = item;
            }

        } else if (type === "packaging") {
            const mode = document.getElementById("packagingModeInput")?.value === "per_package"
                ? "per_package"
                : "per_unit";

            item = {
                name: document.getElementById("packagingNameInput")?.value.trim() || "Kemasan",
                mode,
                quantityUsed: Number(document.getElementById("packagingQuantityInput")?.value) || 0,
                unitPrice: Number(document.getElementById("packagingUnitPriceInput")?.value) || 0,
                packagePrice: Number(document.getElementById("packagingPackagePriceInput")?.value) || 0,
                unitsPerPackage: Number(document.getElementById("packagingUnitsPerPackageInput")?.value) || 0
            };

            if (item.quantityUsed <= 0) {
                alert("Jumlah kemasan yang digunakan harus lebih dari 0.");
                return;
            }

            if (mode === "per_unit" && item.unitPrice <= 0) {
                alert("Harga kemasan per unit harus lebih dari 0.");
                return;
            }

            if (mode === "per_package" && (item.packagePrice <= 0 || item.unitsPerPackage <= 0)) {
                alert("Lengkapi harga paket dan jumlah isi per paket.");
                return;
            }

            if (editIndex === null || editIndex === undefined || !Number.isInteger(editIndex)) {
                detailed.packaging.push(item);
            } else {
                detailed.packaging[editIndex] = item;
            }

        } else if (type === "labor") {
            item = {
                dailyWage: Number(document.getElementById("laborDailyWageInput")?.value) || 0,
                hoursPerDay: Number(document.getElementById("laborHoursPerDayInput")?.value) || 0,
                recipeHours: Number(document.getElementById("laborRecipeHoursInput")?.value) || 0
            };

            if (item.dailyWage <= 0 || item.hoursPerDay <= 0 || item.recipeHours <= 0) {
                alert("Lengkapi upah harian, jam kerja per hari, dan durasi resep.");
                return;
            }

            detailed.labor = item;
        }

        state.additionalCosts.mode = "detailed";
        saveState();
        renderApp();
        prepareAdditionalCostModal();

        if (additionalCostModal && !additionalCostModal.classList.contains("hidden")) {
            updateAdditionalCostModeUI();
        }

    }


    // Menghapus satu komponen Detailed tanpa memengaruhi komponen lainnya.
    function deleteDetailedComponent(type, index = null) {

        if (!confirm("Hapus komponen biaya ini?")) {
            return;
        }

        const detailed =
            state.additionalCosts.detailed;

        if (type === "gas") {
            detailed.gas = null;
        } else if (type === "labor") {
            detailed.labor = null;
        } else if (type === "electricity" && index !== null) {
            detailed.electricity.splice(index, 1);
        } else if (type === "packaging" && index !== null) {
            detailed.packaging.splice(index, 1);
        }

        state.additionalCosts.mode = "detailed";
        saveState();
        renderApp();
        prepareAdditionalCostModal();
        updateAdditionalCostModeUI();

    }


    // Menyimpan mode Simple/Detailed. Nilai mode yang tidak aktif tetap dipertahankan.
    function saveAdditionalCost() {

        const mode =
            additionalCostModeInput?.value === "detailed"
                ? "detailed"
                : "simple";

        if (mode === "simple") {

            const value =
                Number(additionalCostInput?.value) || 0;

            if (value < 0) {
                alert("Biaya tambahan tidak boleh negatif.");
                return;
            }

            state.additionalCosts.mode = "simple";
            state.additionalCosts.simple.total = value;

        } else {

            state.additionalCosts.mode = "detailed";

        }

        saveState();
        closeModal(additionalCostModal);
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

    if (additionalCostModeInput) {

        additionalCostModeInput.addEventListener(
            "change",
            updateAdditionalCostModeUI
        );

    }


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
