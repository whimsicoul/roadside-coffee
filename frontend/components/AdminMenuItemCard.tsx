'use client';

import { useState, useRef, useEffect } from 'react';
import type { MenuItem } from '@/types';

interface AdminMenuItemCardProps {
  item: MenuItem;
  onSave: (id: number, payload: { name: string; price: number; description?: string }) => void;
  onDelete: (id: number, name: string) => void;
  isSaving?: boolean;
  isDeleting?: boolean;
}

export function AdminMenuItemCard({
  item,
  onSave,
  onDelete,
  isSaving,
  isDeleting,
}: AdminMenuItemCardProps) {
  const [name, setName] = useState(item.name);
  const [price, setPrice] = useState(item.price);
  const [description, setDescription] = useState(item.description ?? '');
  const [isDirty, setIsDirty] = useState(false);

  // Sync if item changes from outside (e.g. after save)
  useEffect(() => {
    setName(item.name);
    setPrice(item.price);
    setDescription(item.description ?? '');
    setIsDirty(false);
  }, [item.name, item.price, item.description]);

  const handleSave = () => {
    const parsedPrice = parseFloat(price);
    if (!name.trim() || isNaN(parsedPrice) || parsedPrice <= 0) return;
    onSave(item.id, {
      name: name.trim(),
      price: parsedPrice,
      description: description.trim() || undefined,
    });
  };

  const inputBase =
    'bg-transparent border-b border-transparent hover:border-coffee-oyster focus:border-coffee-judge focus:outline-none transition-colors duration-150';

  return (
    <div
      className="border-b border-coffee-oyster py-6 px-10 flex items-center justify-between gap-8 group"
      style={{
        background: isDirty ? 'rgba(160, 110, 60, 0.04)' : undefined,
        transition: 'background 200ms ease',
      }}
    >

      {/* Left: Editable item details */}
      <div className="flex-1 min-w-0 space-y-1">
        {/* Name */}
        <input
          className={`${inputBase} text-5xl text-coffee-oil font-semibold w-full`}
          value={name}
          onChange={e => { setName(e.target.value); setIsDirty(true); }}
          placeholder="Item name"
          title="Click to edit name"
        />
        {/* Description */}
        <input
          className={`${inputBase} text-4xl text-coffee-judge w-full`}
          value={description}
          onChange={e => { setDescription(e.target.value); setIsDirty(true); }}
          placeholder="Add a description…"
          title="Click to edit description"
        />
      </div>

      {/* Right: Price + admin controls */}
      <div className="flex items-center gap-5 shrink-0">
        {/* Price */}
        <div className="flex items-center gap-1">
          <span className="text-4xl text-coffee-judge font-semibold">$</span>
          <input
            className={`${inputBase} text-4xl text-coffee-judge font-semibold w-20 text-right`}
            value={price}
            type="number"
            min="0"
            step="0.01"
            onChange={e => { setPrice(e.target.value); setIsDirty(true); }}
            title="Click to edit price"
          />
        </div>

        {/* Save button — only visible when dirty */}
        <button
          onClick={handleSave}
          disabled={!isDirty || isSaving}
          className="px-4 py-2 rounded-xl text-sm font-semibold transition-opacity duration-150"
          style={{
            opacity: isDirty ? 1 : 0,
            pointerEvents: isDirty ? 'auto' : 'none',
            background: 'rgba(45, 30, 23, 0.85)',
            color: '#FEFDFB',
            fontSize: '1.2rem',
          }}
        >
          {isSaving ? '…' : 'Save'}
        </button>

        {/* Delete button — visible on row hover via group-hover */}
        <button
          onClick={() => onDelete(item.id, item.name)}
          disabled={isDeleting}
          title="Remove item from menu"
          className="w-9 h-9 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-50 transition-opacity duration-150"
          style={{ color: '#dc2626', fontSize: '1.4rem' }}
        >
          ×
        </button>
      </div>
    </div>
  );
}

interface AdminAddItemRowProps {
  onAdd: (payload: { name: string; price: number; description?: string }) => void;
  isAdding?: boolean;
}

export function AdminAddItemRow({ onAdd, isAdding }: AdminAddItemRowProps) {
  const [expanded, setExpanded] = useState(false);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const nameRef = useRef<HTMLInputElement>(null);

  const handleExpand = () => {
    setExpanded(true);
    setTimeout(() => nameRef.current?.focus(), 50);
  };

  const handleAdd = () => {
    const parsedPrice = parseFloat(price);
    if (!name.trim()) { setError('Name is required'); return; }
    if (isNaN(parsedPrice) || parsedPrice <= 0) { setError('Enter a valid price'); return; }
    setError('');
    onAdd({ name: name.trim(), price: parsedPrice, description: description.trim() || undefined });
    setName('');
    setPrice('');
    setDescription('');
    setExpanded(false);
  };

  const handleCancel = () => {
    setExpanded(false);
    setName('');
    setPrice('');
    setDescription('');
    setError('');
  };

  const inputCls =
    'bg-coffee-cream/40 border border-coffee-oyster rounded-lg px-3 py-2 text-coffee-oil text-sm focus:outline-none focus:border-coffee-judge focus:ring-1 focus:ring-coffee-judge/20 transition-colors duration-150';

  if (!expanded) {
    return (
      <button
        onClick={handleExpand}
        className="flex items-center gap-2 w-full px-10 py-4 text-coffee-roman hover:text-coffee-judge hover:bg-coffee-parchment/40 transition-colors duration-150 border-t border-dashed border-coffee-oyster/60 group"
        style={{ fontSize: '1.5rem' }}
      >
        <span
          className="w-7 h-7 rounded-full border-2 border-current flex items-center justify-center font-bold leading-none transition-transform duration-150 group-hover:scale-110"
          style={{ fontSize: '1.2rem' }}
        >
          +
        </span>
        <span className="font-medium">Add item</span>
      </button>
    );
  }

  return (
    <div
      className="px-10 py-5 border-t border-dashed border-coffee-oyster/60 bg-coffee-parchment/30"
      style={{ animation: 'slideDown 150ms ease' }}
    >
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex-1 min-w-40">
          <label className="block text-xs font-medium text-coffee-roman mb-1">Name *</label>
          <input
            ref={nameRef}
            className={inputCls}
            placeholder="e.g. Oat Latte"
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
          />
        </div>
        <div className="w-28">
          <label className="block text-xs font-medium text-coffee-roman mb-1">Price ($) *</label>
          <input
            className={inputCls}
            type="number"
            min="0"
            step="0.01"
            placeholder="5.00"
            value={price}
            onChange={e => setPrice(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
          />
        </div>
        <div className="flex-1 min-w-40">
          <label className="block text-xs font-medium text-coffee-roman mb-1">Description</label>
          <input
            className={inputCls}
            placeholder="Optional"
            value={description}
            onChange={e => setDescription(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleAdd}
            disabled={isAdding}
            className="px-4 py-2 rounded-lg bg-coffee-judge hover:bg-coffee-oil text-white font-semibold text-sm transition-colors duration-150 disabled:opacity-50"
          >
            {isAdding ? '…' : 'Add'}
          </button>
          <button
            onClick={handleCancel}
            className="px-4 py-2 rounded-lg bg-coffee-oyster/20 hover:bg-coffee-oyster/40 text-coffee-roman font-semibold text-sm transition-colors duration-150"
          >
            Cancel
          </button>
        </div>
      </div>
      {error && <p className="mt-2 text-red-600 text-xs">{error}</p>}
    </div>
  );
}
