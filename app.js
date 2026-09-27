// ========================================
// HPP CALCULATOR
// Basic JavaScript
// ========================================


// Ambil elemen HTML yang kita perlukan
const ingredientsContainer =
    document.getElementById("ingredients");

const addIngredientButton =
    document.getElementById("addIngredient");


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
// TAMBAH BARIS BAHAN
// ========================================

function addIngredient() {

    const row = document.createElement("div");

    row.className = "ingredient-row";

    row.innerHTML = `
        <input
            type="text"
            placeholder="Nama bahan"
            class="ingredient-name"
        >

        <input
            type="number"
            placeholder="Harga beli"
            class="ingredient-price"
            min="0"
        >

        <input
            type="number"
            placeholder="Jumlah dipakai"
            class="ingredient-quantity"
            min="0"
        >
    `;

    ingredientsContainer.appendChild(row);

    attachCalculationEvents();
}


// ========================================
// HITUNG BIAYA BAHAN
// ========================================

function calculateIngredientCost() {

    const rows =
        document.querySelectorAll(".ingredient-row");

    let total = 0;

    rows.forEach(row => {

        const priceInput =
            row.querySelector(".ingredient-price");

        const quantityInput =
            row.querySelector(".ingredient-quantity");

        const price =
            Number(priceInput.value) || 0;

        const quantity =
            Number(quantityInput.value) || 0;

        /*
         * Untuk tahap awal:
         *
         * biaya bahan =
         * harga beli × jumlah
         *
         * Ini masih versi sederhana.
         *
         * Pada tahap berikutnya kita akan
         * menggantinya dengan sistem:
         *
         * harga beli / jumlah pembelian
         * × jumlah yang digunakan
         */

        total += price * quantity;
    });


    document.getElementById(
        "totalIngredientCost"
    ).textContent = formatRupiah(total);


    return total;
}


// ========================================
// PASANG EVENT LISTENER
// ========================================

function attachCalculationEvents() {

    const inputs =
        document.querySelectorAll(
            ".ingredient-price, .ingredient-quantity"
        );

    inputs.forEach(input => {

        input.addEventListener(
            "input",
            calculateIngredientCost
        );

    });
}


// ========================================
// TOMBOL TAMBAH BAHAN
// ========================================

addIngredientButton.addEventListener(
    "click",
    addIngredient
);


// ========================================
// JALANKAN SAAT HALAMAN DIBUKA
// ========================================

attachCalculationEvents();
calculateIngredientCost();
