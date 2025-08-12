<?php

use App\Http\Controllers\BrandController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\ClientController;
use App\Http\Controllers\CommercialController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\EntrerController;
use App\Http\Controllers\LivreurController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\PromotionController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\SecteurController;
use App\Http\Controllers\TransporteurController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\VilleController;
use App\Http\Controllers\AvoirController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::resource('villes', VilleController::class);
    Route::resource('secteurs', SecteurController::class);
    Route::resource('commerciaux', CommercialController::class)->parameters(['commerciaux' => 'commercial']);
    Route::resource('clients', ClientController::class);
    Route::resource('roles', RoleController::class);
    Route::resource('brands', BrandController::class);
    Route::resource('categories', CategoryController::class);
    Route::resource('products', ProductController::class);
    // Ancien: Route::resource('promotions', PromotionController::class);
    // Nouvelles routes séparées pour promotions d'Entrée et de Sortie
    Route::resource('promotions-entrer', App\Http\Controllers\PromotionEntrerController::class)->parameters([
        'promotions-entrer' => 'promotion'
    ]);
    Route::resource('promotions-sortie', App\Http\Controllers\PromotionSortieController::class)->parameters([
        'promotions-sortie' => 'promotion'
    ]);
    Route::resource('livreurs', LivreurController::class);
    Route::resource('transporteurs', TransporteurController::class);
    Route::resource('entrers', EntrerController::class);
    Route::resource('sorties', App\Http\Controllers\SortieController::class)->parameters(['sorties' => 'sortie']);
    Route::resource('avoirs', AvoirController::class)->except(['show', 'create', 'edit']);
    Route::patch('/avoirs/{avoir}/validate', [AvoirController::class, 'validateAvoir'])->name('avoirs.validate');
    Route::get('stocks', [App\Http\Controllers\StockController::class, 'index'])->name('stocks.index');

    Route::resource('users', UserController::class);

    // API routes
    Route::get('/api/secteurs-by-ville', [ClientController::class, 'getSecteursByVille'])->name('api.secteurs-by-ville');
    Route::get('/api/products', [ProductController::class, 'getProducts'])->name('api.products');
    Route::get('/api/product-details/{productId}', [EntrerController::class, 'getProductDetails'])->name('api.product-details');
    Route::get('/api/check-bl-exists/{numeroBl}', [EntrerController::class, 'checkBlExists'])->name('api.check-bl-exists');
    Route::get('/api/bl-details/{numeroBl}', [EntrerController::class, 'getBlDetails'])->name('api.bl-details');
    Route::get('/promotion-for-product/{ref_produit}', [PromotionController::class, 'getPromotionForProduct'])->name('promotion-for-product');

    // API routes for Sorties
    Route::get('/api/sortie-product-details/{productId}', [App\Http\Controllers\SortieController::class, 'getProductDetails'])->name('api.sortie-product-details');
    Route::get('/api/check-sortie-bl-exists/{numeroBl}', [App\Http\Controllers\SortieController::class, 'checkBlExists'])->name('api.check-sortie-bl-exists');
    Route::get('/api/clients-by-commercial/{commercialId}', [App\Http\Controllers\SortieController::class, 'getClientsByCommercial'])->name('api.clients-by-commercial');
    Route::get('/api/next-bl-number', [App\Http\Controllers\SortieController::class, 'getNextBlNumber'])->name('api.next-bl-number');
    Route::patch('/api/sorties/{sortie}/toggle-archived', [App\Http\Controllers\SortieController::class, 'toggleArchived'])->name('api.sorties.toggle-archived');


});

// API routes accessibles sans authentification
Route::get('/avoirs/next-numero', [AvoirController::class, 'getNextNumeroAvoir'])->name('avoirs.next-numero');

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
