<?php

namespace App\Http\Requests\Settings;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->isAdmin();
    }

    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'string', 'max:255'],
            'email' => ['sometimes', 'string', 'email', 'max:255', Rule::unique('users')->ignore($this->route('user'))],
            'role' => ['sometimes', 'string', 'in:admin,manager,cashier'],
            'password' => ['nullable', 'string', 'min:8', 'confirmed'],
            'outlet_id' => ['nullable', 'integer', 'exists:outlets,id'],
        ];
    }
}
