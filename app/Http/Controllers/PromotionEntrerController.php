<?php

namespace App\Http\Controllers;

use App\Models\Promotion;
use App\Models\Product;
use App\Http\Requests\PromotionRequest;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;

class PromotionEntrerController extends Controller
{
    public function index()
    {
        if (!auth()->user() || ! (auth()->user()->can('promotions_entrer.view') || auth()->user()->can('promotions.view'))) {
            abort(403);
        }
        $promotions = Promotion::entrer()
            ->with(['produitPromotionnel:id,product_libelle,product_Ref', 'produitOffert:id,product_libelle,product_Ref'])
            ->orderBy('created_at', 'desc')
            ->get();

        $products = Product::orderBy('product_libelle')->get();

        return Inertia::render('promotion/promotion_entrer/index', [
            'promotions' => $promotions,
            'products' => $products,
        ]);
    }

    public function store(PromotionRequest $request)
    {
        if (!auth()->user() || ! (auth()->user()->can('promotions_entrer.create') || auth()->user()->can('promotions.create'))) {
            abort(403);
        }
        $data = $request->validated();
        // Forcer le type côté serveur pour éviter toute confusion
        $data['mouvement_type'] = 'entrer';
        Promotion::create($data);

        return redirect()->back();
    }

    public function update(PromotionRequest $request, Promotion $promotion)
    {
        if (!auth()->user() || ! (auth()->user()->can('promotions_entrer.edit') || auth()->user()->can('promotions.edit'))) {
            abort(403);
        }
        $data = $request->validated();
        // Forcer le type côté serveur pour éviter les changements indésirables
        $data['mouvement_type'] = 'entrer';
        $updated = $promotion->update($data);
        if (!$updated) {
            Log::error('PromotionEntrerController@update: update failed', ['id' => $promotion->id]);
        }

        return redirect()->back();
    }

    public function destroy(Promotion $promotion)
    {
        if (!auth()->user() || ! (auth()->user()->can('promotions_entrer.delete') || auth()->user()->can('promotions.delete'))) {
            abort(403);
        }
        $deleted = $promotion->delete();
        if (!$deleted) {
            Log::error('PromotionEntrerController@destroy: delete failed', ['id' => $promotion->id]);
        }

        return redirect()->back();
    }
}


