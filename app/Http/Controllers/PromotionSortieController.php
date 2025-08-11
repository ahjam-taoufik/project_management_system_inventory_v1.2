<?php

namespace App\Http\Controllers;

use App\Models\Promotion;
use App\Models\Product;
use App\Http\Requests\PromotionRequest;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;

class PromotionSortieController extends Controller
{
    public function index()
    {
        if (!auth()->user() || ! (auth()->user()->can('promotions_sortie.view') || auth()->user()->can('promotions.view'))) {
            abort(403);
        }
        $promotions = Promotion::sortie()
            ->with(['produitPromotionnel:id,product_libelle,product_Ref', 'produitOffert:id,product_libelle,product_Ref'])
            ->orderBy('created_at', 'desc')
            ->get();

        $products = Product::orderBy('product_libelle')->get();

        return Inertia::render('promotion/promotion_sortie/index', [
            'promotions' => $promotions,
            'products' => $products,
        ]);
    }

    public function store(PromotionRequest $request)
    {
        if (!auth()->user() || ! (auth()->user()->can('promotions_sortie.create') || auth()->user()->can('promotions.create'))) {
            abort(403);
        }
        $data = $request->validated();
        // Forcer le type côté serveur
        $data['mouvement_type'] = 'sortie';
        Promotion::create($data);

        return redirect()->back();
    }

    public function update(PromotionRequest $request, Promotion $promotion)
    {
        if (!auth()->user() || ! (auth()->user()->can('promotions_sortie.edit') || auth()->user()->can('promotions.edit'))) {
            abort(403);
        }
        $data = $request->validated();
        // Forcer le type côté serveur pour éviter les changements indésirables
        $data['mouvement_type'] = 'sortie';
        $updated = $promotion->update($data);
        if (!$updated) {
            Log::error('PromotionSortieController@update: update failed', ['id' => $promotion->id]);
        }

        return redirect()->back();
    }

    public function destroy(Promotion $promotion)
    {
        if (!auth()->user() || ! (auth()->user()->can('promotions_sortie.delete') || auth()->user()->can('promotions.delete'))) {
            abort(403);
        }
        $deleted = $promotion->delete();
        if (!$deleted) {
            Log::error('PromotionSortieController@destroy: delete failed', ['id' => $promotion->id]);
        }

        return redirect()->back();
    }
}


