// ─── Vendor Menu Management — Full-featured ──────────────────────────
// Vendors add unlimited items with name, price, category, photo, discount,
// popular flag, prep time. All changes are INSTANTLY visible to customers
// because both apps read the same shared localStorage DB.

import { useState, useRef } from 'react';
import DB from '../utils/db';
import { FOOD_IMGS, foodImg } from '../utils/constants';

const CATEGORIES = ['Rice','Soup','Local','Snacks','Drinks','Chicken','Pizza','Burger','Dessert','Other'];
const PREP_TIMES  = ['5-10','10-15','15-20','15-25','20-30','25-35','30-45','45-60'];

const fi = {
  width:'100%', padding:'11px 14px', background:'#f9f9f7',
  border:'1.5px solid #e5e0d8', borderRadius:12, fontFamily:'inherit',
  fontSize:14, color:'#1a1a1a', outline:'none',
};

function Label({ children, required }) {
  return (
    <label style={{ display:'block', fontSize:11, fontWeight:700, color:'#7a7a7a', marginBottom:7, textTransform:'uppercase', letterSpacing:.8 }}>
      {children}{required && <span style={{ color:'#ef4444', marginLeft:3 }}>*</span>}
    </label>
  );
}

// ── Item card in the grid ──
function MenuCard({ item, onEdit, onDelete, onToggle }) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const discountedPrice = item.discount > 0
    ? (item.price * (1 - item.discount / 100)).toFixed(2)
    : null;

  return (
    <div style={{ background:'white', borderRadius:18, overflow:'hidden', boxShadow:'0 2px 12px rgba(0,0,0,.06)', border:'1px solid #f0ebe2', transition:'box-shadow .2s' }}
      onMouseEnter={e=>e.currentTarget.style.boxShadow='0 6px 24px rgba(0,0,0,.1)'}
      onMouseLeave={e=>e.currentTarget.style.boxShadow='0 2px 12px rgba(0,0,0,.06)'}>
      {/* Food photo */}
      <div style={{ height:150, position:'relative', overflow:'hidden' }}>
        <img
          src={foodImg(item)}
          alt={item.name}
          style={{ width:'100%', height:'100%', objectFit:'cover', transition:'transform .3s' }}
          onError={e=>{e.target.src=FOOD_IMGS.Default;}}
          onMouseEnter={e=>{e.target.style.transform='scale(1.05)';}}
          onMouseLeave={e=>{e.target.style.transform='scale(1)';}}
        />
        {/* Badges */}
        <div style={{ position:'absolute', top:8, left:8, display:'flex', flexDirection:'column', gap:4 }}>
          {item.popular && <span style={{ background:'#FF6B35', color:'white', fontSize:9, fontWeight:700, padding:'2px 8px', borderRadius:20 }}>Popular</span>}
          {item.discount > 0 && <span style={{ background:'#EF4444', color:'white', fontSize:9, fontWeight:700, padding:'2px 8px', borderRadius:20 }}>-{item.discount}%</span>}
        </div>
        {/* Availability toggle */}
        <button onClick={()=>onToggle(item)} style={{ position:'absolute', top:8, right:8, padding:'4px 10px', background:item.available!==false?'rgba(16,185,129,.9)':'rgba(239,68,68,.85)', border:'none', borderRadius:20, color:'white', fontSize:10, fontWeight:700, cursor:'pointer', backdropFilter:'blur(4px)' }}>
          {item.available!==false ? 'Live' : 'Hidden'}
        </button>
      </div>

      {/* Info */}
      <div style={{ padding:'14px 14px 12px' }}>
        <div style={{ fontWeight:800, fontSize:15, color:'#1a1a1a', marginBottom:3 }}>{item.name}</div>
        <div style={{ fontSize:11, color:'#9a9a9a', marginBottom:10, background:'#f5f5f2', display:'inline-block', padding:'2px 8px', borderRadius:20 }}>{item.category}</div>

        {item.description && (
          <p style={{ fontSize:12, color:'#9a9a9a', lineHeight:1.5, marginBottom:10,
            display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>
            {item.description}
          </p>
        )}

        {/* Price row */}
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
          <span style={{ fontFamily:'Sora,sans-serif', fontWeight:800, fontSize:18, color:'#2d5a3d' }}>
            GH₵{discountedPrice || item.price?.toFixed(2)}
          </span>
          {discountedPrice && (
            <span style={{ fontSize:13, color:'#c0b8a8', textDecoration:'line-through' }}>
              GH₵{item.price?.toFixed(2)}
            </span>
          )}
          {item.preparationTime && (
            <span style={{ marginLeft:'auto', fontSize:11, color:'#9a9a9a' }}>⏱ {item.preparationTime}m</span>
          )}
        </div>

        {!item.imageData && (
          <div style={{ fontSize:11, color:'#c8871a', background:'#fefce8', border:'1px solid #fde68a', borderRadius:8, padding:'5px 10px', marginBottom:10 }}>
            No photo — add one to boost orders
          </div>
        )}

        {/* Action buttons */}
        {confirmDelete ? (
          <div style={{ background:'#fef2f2', border:'1px solid #fecdd3', borderRadius:12, padding:'12px 10px' }}>
            <p style={{ fontFamily:'DM Sans,sans-serif', fontSize:13, color:'#ef4444', fontWeight:600, textAlign:'center', marginBottom:10 }}>
              Delete &ldquo;{item.name}&rdquo;? This cannot be undone.
            </p>
            <div style={{ display:'flex', gap:8 }}>
              <button onClick={()=>{ onDelete(item.id, item.name); setConfirmDelete(false); }}
                style={{ flex:1, padding:'9px', background:'#ef4444', border:'none', borderRadius:10, color:'white', fontFamily:'inherit', fontWeight:700, fontSize:13, cursor:'pointer' }}>
                Yes, Delete
              </button>
              <button onClick={()=>setConfirmDelete(false)}
                style={{ flex:1, padding:'9px', background:'white', border:'1px solid #e5e7eb', borderRadius:10, color:'#374151', fontFamily:'inherit', fontWeight:700, fontSize:13, cursor:'pointer' }}>
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display:'flex', gap:8 }}>
            <button onClick={()=>onEdit(item)} style={{ flex:1, padding:'9px', background:'#f0f7f2', border:'1px solid #c6ddc9', borderRadius:10, color:'#2d5a3d', fontFamily:'inherit', fontWeight:700, fontSize:13, cursor:'pointer', transition:'all .15s' }}>
              Edit
            </button>
            <button onClick={()=>setConfirmDelete(true)} style={{ flex:1, padding:'9px', background:'#fff1f2', border:'1px solid #fecdd3', borderRadius:10, color:'#ef4444', fontFamily:'inherit', fontWeight:700, fontSize:13, cursor:'pointer', transition:'all .15s' }}>
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main MenuPage ────────────────────────────────────────────────────
export default function MenuPage({ vendor, showToast }) {
  const [showModal,  setShowModal]  = useState(false);
  const [editing,    setEditing]    = useState(null);
  const [search,     setSearch]     = useState('');
  const [catFilter,  setCatFilter]  = useState('all');
  const [imgLoading, setImgLoading] = useState(false);
  const [, rerender] = useState(0);
  const fileRef = useRef(null);

  const emptyForm = {
    name:'', price:'', category:'Rice', description:'',
    available:true, imageData:'', discount:0, popular:false,
    preparationTime:'15-25',
  };
  const [form, setForm] = useState(emptyForm);
  const upd = (k, v) => setForm(f => ({ ...f, [k]: v }));

  // All this vendor's items from shared DB
  let items = DB.getMenuByVendor(vendor.id);
  if (search)          items = items.filter(i => i.name.toLowerCase().includes(search.toLowerCase()) || i.description?.toLowerCase().includes(search.toLowerCase()));
  if (catFilter!=='all') items = items.filter(i => i.category === catFilter);

  const allItems  = DB.getMenuByVendor(vendor.id);
  const liveCount = allItems.filter(i => i.available!==false).length;

  // ── Open add/edit modal ──
  const openAdd  = () => { setEditing(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = (item) => {
    setEditing(item);
    setForm({
      name:item.name, price:item.price, category:item.category,
      description:item.description||'', available:item.available!==false,
      imageData:item.imageData||'', discount:item.discount||0,
      popular:item.popular||false, preparationTime:item.preparationTime||'15-25',
    });
    setShowModal(true);
  };

  // ── Image processing ──
  const processImageFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) { showToast('Please select an image file', 'error'); return; }
    if (file.size > 3 * 1024 * 1024) { showToast('Image must be under 3MB', 'error'); return; }
    setImgLoading(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      // Compress: draw onto canvas at max 600px wide
      const img = new Image();
      img.onload = () => {
        const MAX = 600;
        const ratio = Math.min(MAX / img.width, MAX / img.height, 1);
        const canvas = document.createElement('canvas');
        canvas.width  = img.width  * ratio;
        canvas.height = img.height * ratio;
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        const compressed = canvas.toDataURL('image/jpeg', 0.82);
        upd('imageData', compressed);
        setImgLoading(false);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleFileInput = (e)  => processImageFile(e.target.files[0]);
  const handleDragOver  = (e)  => { e.preventDefault(); e.currentTarget.style.borderColor='#2d5a3d'; };
  const handleDragLeave = (e)  => e.currentTarget.style.borderColor = form.imageData?'#2d5a3d':'#e5e0d8';
  const handleDrop      = (e)  => { e.preventDefault(); e.currentTarget.style.borderColor = form.imageData?'#2d5a3d':'#e5e0d8'; processImageFile(e.dataTransfer.files[0]); };

  // ── Save item ──
  const saveItem = () => {
    if (!form.name.trim())           { showToast('Item name is required', 'error'); return; }
    if (!form.price || +form.price<=0) { showToast('Enter a valid price', 'error'); return; }

    const item = {
      id:          editing?.id || DB.genId(),
      vendorId:    vendor.id,
      name:        form.name.trim(),
      price:       parseFloat(form.price),
      category:    form.category,
      description: form.description.trim(),
      available:   form.available,
      imageData:   form.imageData,
      discount:    parseInt(form.discount) || 0,
      popular:     form.popular,
      preparationTime: form.preparationTime,
      createdAt:   editing?.createdAt || new Date().toISOString(),
      updatedAt:   new Date().toISOString(),
    };

    DB.saveMenuItem(item);
    // Record upload timestamp so customer app detects new food
    localStorage.setItem('cb_last_new_item_ts', Date.now().toString());
    setShowModal(false);
    showToast(editing ? `${item.name} updated!` : `${item.name} added to menu!`, 'success');
    rerender(n => n + 1);

    // Notify: item now visible to customers immediately
    if (!editing) showToast('Customers can now see this item', 'info');
  };

  // ── Delete item ──
  const deleteItem = (id, name) => {
    // Confirmation is handled inline in MenuCard, so delete directly here
    DB.deleteMenuItem(id);
    // Record upload change so customer app can refresh
    localStorage.setItem('cb_last_new_item_ts', Date.now().toString());
    showToast(`"${name}" deleted from your menu`, 'info');
    rerender(n => n + 1);
  };

  // ── Toggle availability ──
  const toggleAvail = (item) => {
    DB.saveMenuItem({ ...item, available: !(item.available !== false) });
    showToast(`${item.name} is now ${item.available===false?'live':'hidden'}`, 'success');
    rerender(n => n + 1);
  };

  return (
    <div style={{ padding:28, animation:'fadeUp .4s ease', minHeight:'100vh', background:'#f9f9f7' }}>
      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:22, flexWrap:'wrap', gap:12 }}>
        <div>
          <h1 style={{ fontFamily:'Sora,sans-serif', fontSize:24, fontWeight:800, color:'#1a1a1a' }}>Menu Management</h1>
          <p style={{ color:'#9a9a9a', fontSize:13, marginTop:4 }}>
            {allItems.length} item{allItems.length!==1?'s':''} total · {liveCount} live
            <span style={{ color:'#10b981', fontWeight:700, marginLeft:8 }}>● Customers see changes instantly</span>
          </p>
        </div>
        <button onClick={openAdd} style={{ padding:'11px 22px', background:'#2d5a3d', border:'none', borderRadius:12, color:'white', fontFamily:'inherit', fontWeight:700, fontSize:14, cursor:'pointer', display:'flex', alignItems:'center', gap:8, boxShadow:'0 4px 14px rgba(45,90,61,.35)' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add New Item
        </button>
      </div>

      {/* Search + category filter bar */}
      <div style={{ display:'flex', gap:12, marginBottom:20, flexWrap:'wrap' }}>
        <div style={{ flex:1, minWidth:200, position:'relative' }}>
          <svg style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)' }} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9a9a9a" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search your menu..." style={{ ...fi, paddingLeft:36 }} />
        </div>
        <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
          {['all',...CATEGORIES].map(c=>(
            <button key={c} onClick={()=>setCatFilter(c)} style={{ padding:'9px 14px', borderRadius:20, border:'1.5px solid', borderColor:catFilter===c?'#2d5a3d':'#e5e0d8', background:catFilter===c?'#2d5a3d':'white', color:catFilter===c?'white':'#5a5a5a', fontFamily:'inherit', fontSize:12, fontWeight:catFilter===c?700:400, cursor:'pointer', transition:'all .15s', whiteSpace:'nowrap' }}>
              {c==='all'?'All Categories':c}
            </button>
          ))}
        </div>
      </div>

      {/* Empty state */}
      {!items.length && (
        <div style={{ textAlign:'center', padding:'64px 20px' }}>
          <div style={{ width:80, height:80, borderRadius:20, overflow:'hidden', margin:'0 auto 20px', opacity:.4 }}>
            <img src={FOOD_IMGS.Default} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
          </div>
          <h3 style={{ fontFamily:'Sora,sans-serif', fontWeight:800, fontSize:18, color:'#1a1a1a', marginBottom:8 }}>
            {search||catFilter!=='all' ? 'No items match your filter' : 'Your menu is empty'}
          </h3>
          <p style={{ color:'#9a9a9a', fontSize:14, marginBottom:24 }}>
            {search||catFilter!=='all' ? 'Try a different search or category' : 'Add your first menu item and start receiving orders'}
          </p>
          {!search&&catFilter==='all'&&(
            <button onClick={openAdd} style={{ padding:'12px 28px', background:'#2d5a3d', border:'none', borderRadius:12, color:'white', fontFamily:'inherit', fontWeight:700, fontSize:14, cursor:'pointer' }}>
              Add Your First Item
            </button>
          )}
        </div>
      )}

      {/* Menu item grid */}
      {items.length > 0 && (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:18 }}>
          {items.map(item=>(
            <MenuCard key={item.id} item={item} onEdit={openEdit} onDelete={deleteItem} onToggle={toggleAvail} />
          ))}
        </div>
      )}

      {/* ── Add / Edit Modal ── */}
      {showModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.45)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, backdropFilter:'blur(4px)', padding:20 }}>
          <div style={{ background:'white', borderRadius:22, padding:32, maxWidth:560, width:'100%', animation:'bounceIn .35s ease', maxHeight:'92vh', overflowY:'auto', boxShadow:'0 24px 80px rgba(0,0,0,.2)' }}>

            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
              <h2 style={{ fontFamily:'Sora,sans-serif', fontWeight:800, fontSize:21, color:'#1a1a1a' }}>
                {editing ? 'Edit Item' : 'Add New Item'}
              </h2>
              <button onClick={()=>setShowModal(false)} style={{ width:34, height:34, borderRadius:'50%', background:'#f5f5f5', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>

            {/* ── Photo upload ── */}
            <div style={{ marginBottom:22 }}>
              <Label>Food Photo</Label>
              <div
                style={{ border:`2px dashed ${form.imageData?'#2d5a3d':'#e5e0d8'}`, borderRadius:14, overflow:'hidden', cursor:'pointer', background:form.imageData?'#f0f7f2':'#f9f9f7', transition:'all .2s', minHeight:140, display:'flex', alignItems:'center', justifyContent:'center', position:'relative' }}
                onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
              >
                {imgLoading && (
                  <div style={{ position:'absolute', inset:0, background:'rgba(255,255,255,.8)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:2 }}>
                    <div style={{ width:32, height:32, borderRadius:'50%', border:'3px solid #2d5a3d', borderTopColor:'transparent', animation:'spin 1s linear infinite' }} />
                  </div>
                )}
                {form.imageData ? (
                  <div style={{ position:'relative', width:'100%' }}>
                    <img src={form.imageData} alt="preview" style={{ width:'100%', height:180, objectFit:'cover', display:'block' }} />
                    <button onClick={()=>upd('imageData','')} style={{ position:'absolute', top:8, right:8, width:30, height:30, borderRadius:'50%', background:'rgba(0,0,0,.65)', border:'none', color:'white', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16 }}>×</button>
                    <label htmlFor="food-img-upload" style={{ position:'absolute', bottom:10, right:10, padding:'6px 14px', background:'rgba(255,255,255,.9)', borderRadius:20, fontSize:12, fontWeight:700, cursor:'pointer', color:'#2d5a3d' }}>Change Photo</label>
                  </div>
                ) : (
                  <label htmlFor="food-img-upload" style={{ display:'flex', flexDirection:'column', alignItems:'center', padding:'32px 20px', cursor:'pointer', width:'100%' }}>
                    <div style={{ width:56, height:56, borderRadius:14, overflow:'hidden', marginBottom:14, border:'2px solid #e5e0d8' }}>
                      <img src={FOOD_IMGS[form.category]||FOOD_IMGS.Default} alt="" style={{ width:'100%', height:'100%', objectFit:'cover', opacity:.65 }} />
                    </div>
                    <div style={{ fontSize:14, fontWeight:700, color:'#5a5a5a', marginBottom:4 }}>Drag & drop or click to upload</div>
                    <div style={{ fontSize:12, color:'#9a9a9a', marginBottom:14 }}>JPG · PNG · WEBP · max 3MB · auto-compressed</div>
                    <div style={{ padding:'8px 20px', background:'#2d5a3d', color:'white', borderRadius:20, fontSize:13, fontWeight:700 }}>Choose Photo</div>
                  </label>
                )}
                <input id="food-img-upload" ref={fileRef} type="file" accept="image/*" style={{ display:'none' }} onChange={handleFileInput} />
              </div>
              <p style={{ fontSize:11, color:'#9a9a9a', marginTop:6 }}>Real food photos increase orders by 40%. Customers see this immediately.</p>
            </div>

            {/* ── Name + Price ── */}
            <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:14, marginBottom:14 }}>
              <div>
                <Label required>Item Name</Label>
                <input style={fi} placeholder="e.g. Jollof Rice & Chicken" value={form.name} onChange={e=>upd('name',e.target.value)} />
              </div>
              <div>
                <Label required>Price (GH₵)</Label>
                <input style={fi} type="number" min="0" step="0.01" placeholder="0.00" value={form.price} onChange={e=>upd('price',e.target.value)} />
              </div>
            </div>

            {/* ── Category + Prep time ── */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:14 }}>
              <div>
                <Label>Category</Label>
                <select style={fi} value={form.category} onChange={e=>upd('category',e.target.value)}>
                  {CATEGORIES.map(c=><option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <Label>Prep Time</Label>
                <select style={fi} value={form.preparationTime} onChange={e=>upd('preparationTime',e.target.value)}>
                  {PREP_TIMES.map(t=><option key={t} value={t}>{t} mins</option>)}
                </select>
              </div>
            </div>

            {/* ── Description ── */}
            <div style={{ marginBottom:14 }}>
              <Label>Description</Label>
              <textarea style={{ ...fi, resize:'vertical', minHeight:80 }} rows={3}
                placeholder="Describe the dish — key ingredients, how it's cooked..."
                value={form.description} onChange={e=>upd('description',e.target.value)} />
            </div>

            {/* ── Discount + Popular + Available ── */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12, marginBottom:24 }}>
              <div>
                <Label>Discount %</Label>
                <input style={fi} type="number" min="0" max="80" placeholder="0" value={form.discount} onChange={e=>upd('discount',e.target.value)} />
              </div>
              <div>
                <Label>Popular</Label>
                <div onClick={()=>upd('popular',!form.popular)} style={{ height:42, border:`1.5px solid ${form.popular?'#2d5a3d':'#e5e0d8'}`, borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', background:form.popular?'#ecfdf5':'#f9f9f7', fontWeight:700, fontSize:13, color:form.popular?'#2d5a3d':'#9a9a9a', transition:'all .15s', userSelect:'none' }}>
                  {form.popular?'Featured':'Normal'}
                </div>
              </div>
              <div>
                <Label>Visibility</Label>
                <div onClick={()=>upd('available',!form.available)} style={{ height:42, border:`1.5px solid ${form.available?'#10b981':'#e5e0d8'}`, borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', background:form.available?'#ecfdf5':'#fef9ee', fontWeight:700, fontSize:13, color:form.available?'#10b981':'#9a9a9a', transition:'all .15s', userSelect:'none' }}>
                  {form.available?'Live':'Hidden'}
                </div>
              </div>
            </div>

            {/* ── Save / Cancel ── */}
            <div style={{ display:'flex', gap:12 }}>
              <button onClick={saveItem} style={{ flex:2, padding:'14px', background:'#2d5a3d', border:'none', borderRadius:14, color:'white', fontFamily:'inherit', fontWeight:800, fontSize:15, cursor:'pointer', transition:'all .15s' }}>
                {editing ? 'Save Changes' : 'Add to Menu'}
              </button>
              <button onClick={()=>setShowModal(false)} style={{ flex:1, padding:'14px', background:'#f5f5f5', border:'1px solid #e5e0d8', borderRadius:14, color:'#5a5a5a', fontFamily:'inherit', fontWeight:700, fontSize:14, cursor:'pointer' }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
