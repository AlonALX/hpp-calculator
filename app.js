// ========================================
// HPP CALCULATOR
// STEP 7.3
// Ingredient Calculator + Unit Conversion
// ========================================


// ========================================
// ELEMENT
// ========================================

const ingredientsContainer =
    document.getElementById("ingredients");

const addIngredientButton =
    document.getElementById("addIngredient");

const yieldQuantityInput =
    document.getElementById("yieldQuantity");

const totalIngredientCostElement =
    document.getElementById("totalIngredientCost");

const totalProductionCostElement =
    document.getElementById("totalProductionCost");

const hppPerUnitElement =
    document.getElementById("hppPerUnit");


// ========================================
// UNIT SYSTEM
// ========================================
//
// baseUnit digunakan untuk menyamakan
// satuan sebelum melakukan perhitungan.
//
// Berat:
// kg -> g
//
// Volume:
// L -> ml
//
// Jumlah:
// pcs -> pcs
// unit -> pcs
// butir -> pcs
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
// CONVERT TO BASE UNIT
// ========================================

function convertToBaseUnit(quantity, unit) {

    const definition = UNIT_DEFINITIONS[unit];

    if (!definition) {
        return null;
    }

    return Number(quantity) * definition.multiplier;
}


// ========================================
// CEK KOMPATIBILITAS UNIT
// ========================================

function areUnitsCompatible(
    purchaseUnit,
    usageUnit
) {

    const purchaseDefinition =
        UNIT_DEFINITIONS[purchaseUnit];

    const usageDefinition =
        UNIT_DEFINITIONS[usageUnit];

    if (!purchaseDefinition || !usageDefinition) {
        return false;
    }

    return (
        purchaseDefinition.category ===
        usageDefinition.category
    );
}


// ========================================
// BUAT SELECT UNIT
// ========================================

function createUnitOptions() {

    return `
        <option value="kg">kg</option>
        <option value="g">g</option>
        <option value="L">L</option>
        <option value="ml">ml</option>
        <option value="pcs">pcs</option>
        <option value="unit">unit</option>
        <option value="butir">butir</option>
    `;
}


// ========================================
// TAMBAH BAHAN
// ========================================

function addIngredient() {

    const card =
        document.createElement("div");

    card.className = "ingredient-card";

    card.innerHTML = `

        <h3>Bahan</h3>

        <div class="form-group">

            <label>
                Nama bahan
            </label>

            <input
                type="text"
                class="ingredient-name"
                placeholder="Contoh: Tepung"
            >

        </div>


        <div class="ingredient-purchase">

            <div class="form-group">

                <label>
                    Harga beli
                </label>

                <input
                    type="number"
                    class="ingredient-price"
                    min="0"
                    step="any"
                    inputmode="decimal"
                    placeholder="Contoh: 15000"
                >

            </div>


            <div class="form-group">

                <label>
                    Jumlah beli
                </label>

                <input
                    type="number"
                    class="ingredient-purchase-quantity"
                    min="0"
                    step="any"
                    inputmode="decimal"
                    placeholder="1"
                >

            </div>

        </div>


        <div class="form-group">

            <label>
                Unit pembelian
            </label>

            <select class="ingredient-purchase-unit">

                ${createUnitOptions()}

            </select>

        </div>


        <div class="ingredient-usage">

            <div class="form-group">

                <label>
                    Jumlah digunakan
                </label>

                <input
                    type="number"
                    class="ingredient-usage-quantity"
                    min="0"
                    step="any"
                    inputmode="decimal"
                    placeholder="Contoh: 250"
                >

            </div>


            <div class="form-group">

                <label>
                    Unit penggunaan
                </label>

                <select class="ingredient-usage-unit">

                    ${createUnitOptions()}

                </select>

            </div>

        </div>


        <div class="ingredient-cost">

            <span>
                Biaya bahan
            </span>

            <strong class="ingredient-cost-value">
                Rp0
            </strong>

        </div>


        <div
            class="ingredient-status"
            style="
                display:none;
                margin-top:8px;
                color:#b91c1c;
                font-size:13px;
            "
        ></div>


        <button
            type="button"
            class="remove-button"
        >
            Hapus bahan
        </button>

    `;


    ingredientsContainer.appendChild(card);

    calculateAll();
}


// ========================================
// HITUNG BIAYA SATU BAHAN
// ========================================

function calculateIngredient(card) {

    const priceInput =
        card.querySelector(".ingredient-price");

    const purchaseQuantityInput =
        card.querySelector(
            ".ingredient-purchase-quantity"
        );

    const purchaseUnitInput =
        card.querySelector(
            ".ingredient-purchase-unit"
        );

    const usageQuantityInput =
        card.querySelector(
            ".ingredient-usage-quantity"
        );

    const usageUnitInput =
        card.querySelector(
            ".ingredient-usage-unit"
        );

    const costElement =
        card.querySelector(
            ".ingredient-cost-value"
        );

    const statusElement =
        card.querySelector(
            ".ingredient-status"
        );


    const price =
        Number(priceInput.value) || 0;

    const purchaseQuantity =
        Number(purchaseQuantityInput.value) || 0;

    const usageQuantity =
        Number(usageQuantityInput.value) || 0;

    const purchaseUnit =
        purchaseUnitInput.value;

    const usageUnit =
        usageUnitInput.value;


    // Reset status

    statusElement.style.display = "none";
    statusElement.textContent = "";

    costElement.textContent = "Rp0";


    // Belum lengkap

    if (
        price <= 0 ||
        purchaseQuantity <= 0 ||
        usageQuantity <= 0
    ) {

        return 0;

    }


    // Cek unit

    if (
        !areUnitsCompatible(
            purchaseUnit,
            usageUnit
        )
    ) {

        statusElement.textContent =
            "Unit pembelian dan unit penggunaan tidak kompatibel.";

        statusElement.style.display = "block";

        return 0;

    }


    // Convert ke base unit

    const purchaseBaseQuantity =
        convertToBaseUnit(
            purchaseQuantity,
            purchaseUnit
        );

    const usageBaseQuantity =
        convertToBaseUnit(
            usageQuantity,
            usageUnit
        );


    if (
        purchaseBaseQuantity <= 0 ||
        usageBaseQuantity <= 0
    ) {

        return 0;

    }


    // ====================================
    // FORMULA HPP BAHAN
    // ====================================
    //
    // Harga beli
    // ÷ jumlah pembelian
    // × jumlah penggunaan
    //
    // ====================================

    const cost =
        (
            price /
            purchaseBaseQuantity
        ) *
        usageBaseQuantity;


    costElement.textContent =
        formatRupiah(cost);


    return cost;
}


// ========================================
// HITUNG SEMUA
// ========================================

function calculateAll() {

    const cards =
        document.querySelectorAll(
            ".ingredient-card"
        );

    let totalIngredientCost = 0;


    cards.forEach(card => {

        totalIngredientCost +=
            calculateIngredient(card);

    });


    // Total biaya bahan

    totalIngredientCostElement.textContent =
        formatRupiah(totalIngredientCost);


    // Yield

    const yieldQuantity =
        Number(yieldQuantityInput.value) || 0;


    // Untuk sekarang additional cost = 0
    //
    // Gas, listrik, packaging, dan labor
    // akan kita tambahkan pada tahap berikutnya.

    const totalProductionCost =
        totalIngredientCost;


    totalProductionCostElement.textContent =
        formatRupiah(totalProductionCost);


    // HPP per unit

    if (yieldQuantity > 0) {

        const hppPerUnit =
            totalProductionCost /
            yieldQuantity;

        hppPerUnitElement.textContent =
            formatRupiah(hppPerUnit);

    } else {

        hppPerUnitElement.textContent =
            "Rp0";

    }

}


// ========================================
// EVENT: TAMBAH BAHAN
// ========================================

addIngredientButton.addEventListener(
    "click",
    addIngredient
);


// ========================================
// EVENT: INPUT / SELECT
// ========================================

ingredientsContainer.addEventListener(
    "input",
    calculateAll
);

ingredientsContainer.addEventListener(
    "change",
    calculateAll
);

yieldQuantityInput.addEventListener(
    "input",
    calculateAll
);


// ========================================
// EVENT: HAPUS BAHAN
// ========================================

ingredientsContainer.addEventListener(
    "click",
    function(event) {

        if (
            event.target.classList.contains(
                "remove-button"
            )
        ) {

            const card =
                event.target.closest(
                    ".ingredient-card"
                );

            if (card) {

                card.remove();

                calculateAll();

            }

        }

    }
);


// ========================================
// BAHAN PERTAMA
// ========================================

addIngredient();


// ========================================
// INITIAL CALCULATION
// ========================================

calculateAll();
