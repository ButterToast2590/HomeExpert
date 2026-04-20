// =====================================================================
//  FIREBASE GLOBALS (initialized in HTML <head>)
// =====================================================================
const db = window.firebaseDB;
const auth = window.firebaseAuth;

// =====================================================================
//  FIREBASE HELPERS
// =====================================================================
const FirebaseHelpers = {
  // Load services from Firestore
  async loadServices() {
    try {
      const { collection, getDocs } = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js');
      const qSnapshot = await getDocs(collection(window.firebaseDB, 'services'));
      return qSnapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));
    } catch (e) {
      console.warn('Services Firestore error, using mock:', e.message);
      return DB.services;
    }
  },

  // Load workers from Firestore
  async loadWorkers() {
    try {
      const { collection, getDocs } = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js');
      const qSnapshot = await getDocs(collection(window.firebaseDB, 'workers'));
      return qSnapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));
    } catch (e) {
      console.warn('Workers Firestore error, using mock:', e.message);
      return DB.workers;
    }
  },

  // Load bookings for a specific user
  async loadBookings(userId) {
    try {
      const { collection, getDocs, query, where } = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js');
      const q = query(collection(window.firebaseDB, 'bookings'), where('customerId', '==', userId));
      const qSnapshot = await getDocs(q);
      return qSnapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));
    } catch (e) {
      console.warn('Bookings Firestore error, using mock:', e.message);
      return DB.bookings.filter(b => b.customerId === userId);
    }
  },

  // Load all bookings (for admin)
  async loadAllBookings() {
    try {
      const { collection, getDocs, query, orderBy } = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js');
      const q = query(collection(window.firebaseDB, 'bookings'), orderBy('createdAt', 'desc'));
      const qSnapshot = await getDocs(q);
      return qSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (e) {
      console.error('Admin Load Error:', e);
      return [];
    }
  },

  // Load reviews from Firestore
  async loadReviews() {
    try {
      const { collection, getDocs } = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js');
      const qSnapshot = await getDocs(collection(window.firebaseDB, 'reviews'));
      return qSnapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));
    } catch (e) {
      console.warn('Reviews Firestore error, using mock:', e.message);
      return DB.reviews;
    }
  },

  // Load users from Firestore
  async loadUsers() {
    try {
      const { collection, getDocs } = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js');
      const qSnapshot = await getDocs(collection(window.firebaseDB, 'users'));
      return qSnapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));
    } catch (e) {
      console.warn('Users Firestore error, using mock:', e.message);
      return DB.users;
    }
  },

  // Load site content from Firestore
  async loadContent() {
    try {
      const { doc, getDoc } = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js');
      const docSnap = await getDoc(doc(window.firebaseDB, 'settings', 'content'));
      return docSnap.exists() ? docSnap.data() : DB.content;
    } catch (e) {
      console.warn('Content Firestore error, using mock:', e.message);
      return DB.content;
    }
  },

  // Update user profile in Firestore
  async updateUserData(userId, data) {
    if (!userId || userId === 'guest') {
      console.warn("Cannot update Firebase: No valid User ID provided.");
      return false;
    }
    try {
      const { doc, updateDoc } = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js');
      const userRef = doc(window.firebaseDB, 'users', userId);
      await updateDoc(userRef, data);
      return true;
    } catch (e) {
      console.error('Error updating profile in Firebase:', e);
      return false;
    }
  },

  // Create a booking in Firestore
  async createBooking(bookingData) {
    try {
      const { collection, addDoc, serverTimestamp } = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js');
      const finalData = {
        ...bookingData,
        createdAt: serverTimestamp(),
        status: 'pending'
      };
      const docRef = await addDoc(collection(window.firebaseDB, 'bookings'), finalData);
      return docRef.id;
    } catch (e) {
      console.error('Error saving booking to Firebase:', e);
      return null;
    }
  },

  // Update booking status in Firestore
  async updateBookingStatus(bookingId, newStatus) {
    try {
      const { doc, updateDoc } = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js');
      const bookingRef = doc(window.firebaseDB, 'bookings', bookingId);
      await updateDoc(bookingRef, { status: newStatus });
      return true;
    } catch (e) {
      console.error("Firestore Update Error:", e);
      return false;
    }
  },

  // Load dashboard stats from Firestore
  async loadStats() {
    try {
      const { collection, getDocs } = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js');
      const qSnapshot = await getDocs(collection(window.firebaseDB, 'bookings'));
      const allBookings = qSnapshot.docs.map(doc => doc.data());
      const completed = allBookings.filter(b => b.status === 'completed');
      const revenue = completed.reduce((sum, b) => sum + (Number(b.price) || 0), 0);
      return {
        total: allBookings.length,
        completed: completed.length,
        revenue: revenue,
      };
    } catch (e) {
      console.error('Error loading stats from Firebase:', e);
      return null;
    }
  },

  // ── SERVICES (Firestore) ──
  async createService(data) {
    const { collection, addDoc } = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js');
    const docRef = await addDoc(collection(window.firebaseDB, 'services'), data);
    return docRef.id;
  },

  async updateService(id, data) {
    const { doc, updateDoc } = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js');
    await updateDoc(doc(window.firebaseDB, 'services', String(id)), data);
  },

  async deleteService(id) {
    const { doc, deleteDoc } = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js');
    await deleteDoc(doc(window.firebaseDB, 'services', String(id)));
  },

  // ── USERS (Firestore) ──
  async setUserStatus(userId, status) {
    try {
      const { doc, updateDoc } = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js');
      await updateDoc(doc(window.firebaseDB, 'users', userId), { status });
      return true;
    } catch (e) {
      console.error('Error updating user status:', e);
      return false;
    }
  },

  // ── REVIEWS (Firestore) ──
  async createReview(reviewData) {
    const { collection, addDoc, serverTimestamp } = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js');
    const docRef = await addDoc(collection(window.firebaseDB, 'reviews'), {
      ...reviewData,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  },

  async updateReview(id, data) {
    const { doc, updateDoc } = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js');
    await updateDoc(doc(window.firebaseDB, 'reviews', String(id)), data);
  },

  async deleteReview(id) {
    const { doc, deleteDoc } = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js');
    await deleteDoc(doc(window.firebaseDB, 'reviews', String(id)));
  },

  // ── SITE CONTENT (Firestore) ──
  async saveContent(contentData) {
    try {
      const { doc, setDoc } = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js');
      await setDoc(doc(window.firebaseDB, 'settings', 'content'), contentData);
      return true;
    } catch (e) {
      console.error('Error saving content to Firebase:', e);
      return false;
    }
  }
};


// =====================================================================
//  DATABASE LAYER  (mock / fallback only)
// =====================================================================
const DB = {
  _nextId: { services: 100, workers: 100, bookings: 200, users: 100, reviews: 100 },
  _genId(table){ return ++this._nextId[table]; },

  // ---- SERVICES ----
  services: [
    {id:1,category:'Plumbing',name:'Pipe Repair',price:'₱350–₱800',duration:'1–2 hrs',icon:'🔧',desc:'Fix leaking pipes, water line issues, and drain clogs.',rating:4.8,reviews:124,featured:true,active:true},
    {id:2,category:'Plumbing',name:'Faucet Replacement',price:'₱200–₱500',duration:'30–60 min',icon:'🚿',desc:'Install or replace bathroom and kitchen faucets.',rating:4.7,reviews:89,featured:false,active:true},
    {id:3,category:'Plumbing',name:'Water Heater Install',price:'₱800–₱1,500',duration:'2–3 hrs',icon:'♨️',desc:'Install or repair electric water heaters.',rating:4.9,reviews:56,featured:true,active:true},
    {id:4,category:'Electrical',name:'Wiring & Outlets',price:'₱500–₱1,200',duration:'2–4 hrs',icon:'⚡',desc:'Fix faulty wiring, install outlets and switches.',rating:4.6,reviews:201,featured:true,active:true},
    {id:5,category:'Electrical',name:'Ceiling Fan Install',price:'₱300–₱700',duration:'1–2 hrs',icon:'💨',desc:'Install or repair ceiling and exhaust fans.',rating:4.8,reviews:145,featured:false,active:true},
    {id:6,category:'Electrical',name:'Circuit Breaker Fix',price:'₱400–₱900',duration:'1–3 hrs',icon:'🔌',desc:'Troubleshoot and repair circuit breaker problems.',rating:4.7,reviews:78,featured:false,active:true},
    {id:7,category:'Cleaning',name:'Deep House Cleaning',price:'₱1,200–₱2,500',duration:'4–6 hrs',icon:'🧹',desc:'Full house deep clean including all rooms and bathrooms.',rating:4.9,reviews:312,featured:true,active:true},
    {id:8,category:'Cleaning',name:'Post-Construction Cleaning',price:'₱2,000–₱4,000',duration:'6–8 hrs',icon:'🧽',desc:'Remove dust, debris, and paint after renovation.',rating:4.8,reviews:67,featured:false,active:true},
    {id:9,category:'Aircon',name:'Aircon Cleaning',price:'₱350–₱600',duration:'1–2 hrs',icon:'❄️',desc:'Clean filters, coils and improve cooling efficiency.',rating:4.9,reviews:289,featured:true,active:true},
    {id:10,category:'Aircon',name:'Aircon Installation',price:'₱1,500–₱3,000',duration:'3–5 hrs',icon:'🌬️',desc:'Install new split-type or window-type aircon units.',rating:4.7,reviews:134,featured:true,active:true},
    {id:11,category:'Carpentry',name:'Furniture Assembly',price:'₱300–₱800',duration:'1–3 hrs',icon:'🪚',desc:'Assemble flat-pack furniture and fix loose joints.',rating:4.6,reviews:98,featured:false,active:true},
    {id:12,category:'Painting',name:'Room Painting',price:'₱800–₱2,000',duration:'4–8 hrs',icon:'🎨',desc:'Interior room painting with prep and cleanup.',rating:4.8,reviews:76,featured:false,active:true},
    {id:13,category:'Pest Control',name:'Cockroach Treatment',price:'₱500–₱1,000',duration:'1–2 hrs',icon:'🦟',desc:'Chemical treatment to eliminate cockroach infestation.',rating:4.7,reviews:143,featured:false,active:true},
    {id:14,category:'Appliance Repair',name:'Washing Machine Repair',price:'₱500–₱1,200',duration:'1–3 hrs',icon:'🔩',desc:'Diagnose and fix washing machine issues.',rating:4.6,reviews:112,featured:false,active:true},
  ],
  getService(id){ return this.services.find(s=>String(s.id)===String(id)); },
  getServices(){ return [...this.services]; },
  createService(data){
    const s={...data,id:this._genId('services'),rating:parseFloat(data.rating)||4.5,reviews:parseInt(data.reviews)||0,featured:false,active:true};
    this.services.push(s); return s;
  },
  updateService(id,data){
    const idx=this.services.findIndex(s=>String(s.id)===String(id));
    if(idx<0) return null;
    this.services[idx]={...this.services[idx],...data,id};
    return this.services[idx];
  },
  deleteService(id){ this.services=this.services.filter(s=>String(s.id)!==String(id)); },

  // ---- WORKERS ----
  workers: [
    {id:'w1',name:'Carlos Reyes',avatar:'CR',categories:['Plumbing','Appliance Repair'],rating:4.9,jobs:234,verified:true,price:'₱400/hr',status:'active',email:'carlos@workers.ph',phone:'+63 917 100 0001',joined:'Jan 2025'},
    {id:'w2',name:'Maria Santos',avatar:'MS',categories:['Cleaning'],rating:5.0,jobs:189,verified:true,price:'₱350/hr',status:'active',email:'maria@workers.ph',phone:'+63 917 100 0002',joined:'Feb 2025'},
    {id:'w3',name:'Ronaldo Cruz',avatar:'RC',categories:['Electrical','Carpentry'],rating:4.8,jobs:156,verified:true,price:'₱450/hr',status:'active',email:'ronaldo@workers.ph',phone:'+63 917 100 0003',joined:'Mar 2025'},
    {id:'w4',name:'Jenny Flores',avatar:'JF',categories:['Aircon'],rating:4.9,jobs:298,verified:true,price:'₱500/hr',status:'active',email:'jenny@workers.ph',phone:'+63 917 100 0004',joined:'Apr 2025'},
    {id:'w5',name:'Boy Dela Pena',avatar:'BP',categories:['Painting','Carpentry'],rating:4.7,jobs:123,verified:false,price:'₱380/hr',status:'pending',email:'boy@workers.ph',phone:'+63 917 100 0005',joined:'Jan 2026'},
    {id:'w6',name:'Ana Gomez',avatar:'AG',categories:['Cleaning','Pest Control'],rating:4.8,jobs:211,verified:true,price:'₱360/hr',status:'active',email:'ana@workers.ph',phone:'+63 917 100 0006',joined:'Jun 2025'},
  ],
  getWorker(id){ return this.workers.find(w=>String(w.id)===String(id)); },
  getWorkers(){ return [...this.workers]; },
  createWorker(data){
    const initials=data.name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase();
    const w={...data,avatar:initials,jobs:parseInt(data.jobs)||0,rating:parseFloat(data.rating)||4.5,verified:data.verified==='true'||data.verified===true,joined:new Date().toLocaleDateString('en-US',{month:'short',year:'numeric'})};
    this.workers.push(w); return w;
  },
  updateWorker(id,data){
    const idx=this.workers.findIndex(w=>String(w.id)===String(id));
    if(idx<0) return null;
    if(data.name) data.avatar=data.name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase();
    data.verified=data.verified==='true'||data.verified===true;
    this.workers[idx]={...this.workers[idx],...data,id};
    return this.workers[idx];
  },
  deleteWorker(id){ this.workers=this.workers.filter(w=>String(w.id)!==String(id)); },

  // ---- BOOKINGS ----
  bookings: [],
  getBooking(id){ return this.bookings.find(b=>b.id===id); },
  getBookings(){ return [...this.bookings]; },
  createBooking(data){
    const b={...data,id:'BK'+String(Date.now()).slice(-6),status:'pending'};
    this.bookings.unshift(b); return b;
  },
  updateBookingStatus(id,status){
    const b=this.bookings.find(x=>x.id===id);
    if(b){ b.status=status; return b; } return null;
  },
  markRated(id,rating){ const b=this.bookings.find(x=>x.id===id); if(b){b.rated=true;b.userRating=rating;} },

  // ---- ADMIN CREDENTIALS ----
  adminCredentials: [
    {email:'admin@homexperts.ph', password:'HX@Admin2026!', name:'Admin'}
  ],
  isAdmin(email,pass){ return this.adminCredentials.some(a=>a.email===email&&a.password===pass); },

  // ---- USERS ----
  users: [],
  getUser(id){ return this.users.find(u=>u.id===id); },
  getUsers(){ return [...this.users]; },
  disableUser(id){ const u=this.users.find(x=>x.id===id); if(u) u.status='disabled'; },
  enableUser(id){ const u=this.users.find(x=>x.id===id); if(u) u.status='active'; },

  // ---- REVIEWS ----
  reviews: [],
  getReviews(){ return [...this.reviews]; },
  deleteReview(id){ this.reviews=this.reviews.filter(r=>String(r.id)!==String(id)); },
  flagReview(id,val){ const r=this.reviews.find(x=>String(x.id)===String(id)); if(r) r.flagged=val!==undefined?val:!r.flagged; },

  // ---- SITE CONTENT ----
  content: {
    tagline:'Your trusted home service platform',
    promoLabel:'Limited Offer',promoTitle:'First Booking? Get 20% Off!',
    promoCode:'FIRST20',promoSub:'Use code FIRST20 at checkout',
    stat1Num:'4.9★',stat1Lbl:'Avg Rating',
    stat2Num:'47',stat2Lbl:'Workers',
    stat3Num:'1.2K+',stat3Lbl:'Jobs Done',
    featuredIds:['1','3','4','7','9','10'],
    visibleCategories:['Plumbing','Electrical','Cleaning','Aircon','Carpentry','Painting','Pest Control','Appliance Repair']
  },
  getContent(){ return {...this.content}; },
  updateContent(data){ this.content={...this.content,...data}; },

  // ---- STATS ----
  stats(){
    const total=this.bookings.length;
    const completed=this.bookings.filter(b=>b.status==='completed').length;
    const revenue=this.bookings.filter(b=>b.status==='completed').reduce((s,b)=>s+(Number(b.price)||0),0);
    const activeWorkers=this.workers.filter(w=>w.status==='active').length;
    const pendingWorkers=this.workers.filter(w=>!w.verified).length;
    const totalUsers=this.users.length;
    const avgRating=this.reviews.length?(this.reviews.reduce((s,r)=>s+r.rating,0)/this.reviews.length).toFixed(1):'0.0';
    return {total,completed,revenue,activeWorkers,pendingWorkers,totalUsers,avgRating};
  }
};

// =====================================================================
//  APP STATE
// =====================================================================
let state = {
  user:null, screen:'login', prevScreen:null,
  selectedService:null, selectedWorker:null, bookingData:{},
  bookingFilter:'all', userBookings:[], screenHistory:[]
};

// =====================================================================
//  UTILITIES
// =====================================================================
let toastTimer;
function showToast(msg){
  clearTimeout(toastTimer);
  const t=document.getElementById('toast');
  t.textContent=msg; t.classList.add('show');
  toastTimer=setTimeout(()=>t.classList.remove('show'),2800);
}

function togglePass(id,btn){
  const el=document.getElementById(id);
  const eyeIcon=btn.querySelector('.eye-icon use')||btn.querySelector('use');
  if(el.type==='password'){
    el.type='text';
    if(eyeIcon) eyeIcon.setAttribute('href','#ic-eye-off');
    else btn.textContent='Hide';
  } else {
    el.type='password';
    if(eyeIcon) eyeIcon.setAttribute('href','#ic-eye');
    else btn.textContent='Show';
  }
}

function validateTerms(){
  const cb=document.getElementById('reg-terms');
  const err=document.getElementById('terms-error');
  const row=document.getElementById('terms-row');
  if(!cb) return;
  if(cb.checked){
    if(err) err.style.display='none';
    if(row) row.style.borderColor='var(--brand)';
  } else {
    if(row) row.style.borderColor='var(--brand-light)';
  }
}

function fmtDate(d){
  if(!d) return '—';
  try{ return new Date(d+'T00:00:00').toLocaleDateString('en-PH',{weekday:'short',month:'short',day:'numeric',year:'numeric'}); }
  catch(e){ return d; }
}

function statusBadge(s){
  const map={pending:'badge-yellow',upcoming:'badge-blue',accepted:'badge-green',completed:'badge-green',cancelled:'badge-red'};
  return `<span class="badge ${map[s]||'badge-gray'}">${s.charAt(0).toUpperCase()+s.slice(1)}</span>`;
}

// =====================================================================
//  NAVIGATION
// =====================================================================
function goScreen(name){
  document.querySelectorAll('.modal-overlay').forEach(m=>m.classList.remove('open'));
  const prev=state.screen;
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
  const el=document.getElementById('screen-'+name);
  if(el){
    el.classList.add('active');
    const sc=el.querySelector('.scroll-content');
    if(sc) sc.scrollTop=0;
  }
  if(prev!==name){
    state.screenHistory.push(prev);
    if(state.screenHistory.length>10) state.screenHistory.shift();
  }
  state.prevScreen=prev;
  state.screen=name;
}

function goBack(){
  const prev=state.screenHistory.pop()||'home';
  const el=document.getElementById('screen-'+prev);
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
  if(el) el.classList.add('active');
  state.screen=prev;
}

function closeRatingScreen(){
  document.getElementById('screen-rating').classList.remove('active');
  state.screen=state.prevScreen||'bookings';
}

function goToTab(tab){
  state.screenHistory=[];
  if(tab==='home'){renderHome();goScreen('home');}
  else if(tab==='bookings'){renderBookings();goScreen('bookings');}
  else if(tab==='profile'){renderProfile();goScreen('profile');}
}

// =====================================================================
//  AUTH
// =====================================================================
async function doLogin(){
  const email=document.getElementById('login-email').value.trim();
  const pass=document.getElementById('login-password').value;
  if(!email||!pass){showToast('Please fill in all fields');return;}
  
  try {
    const { signInWithEmailAndPassword } = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js');
    const userCredential = await signInWithEmailAndPassword(window.firebaseAuth, email, pass);
    const user = userCredential.user;
    
    const { doc, getDoc } = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js');
    const userProfileSnap = await getDoc(doc(window.firebaseDB, 'users', user.uid));
    
    if(!userProfileSnap.exists()) {
      showToast('User profile not found'); return;
    }
    
    state.user = {id: user.uid, email: user.email, ...userProfileSnap.data()};
    state.userBookings = await FirebaseHelpers.loadBookings(user.uid);
    state.userBookings = state.userBookings.map(enrichBooking);
    showToast('Welcome back, ' + state.user.name.split(' ')[0] + ' 👋');
    renderHome(); 
    setTimeout(()=>goScreen('home'),300);
  } catch (error) {
    showToast('❌ ' + (error.message || 'Login failed'));
  }
}

async function guestLogin(){
  state.user={id:'GUEST',name:'Guest',email:'guest@homexperts.ph',phone:'',address:''};
  state.userBookings=[];
  renderHome(); 
  goScreen('home');
}

async function doRegister(){
  const name=document.getElementById('reg-name').value.trim();
  const email=document.getElementById('reg-email').value.trim();
  const phone=document.getElementById('reg-phone').value.trim();
  const pass=document.getElementById('reg-password').value;
  const confirmPass=document.getElementById('reg-confirm-password').value;
  const termsChecked=document.getElementById('reg-terms')?.checked;

  if(!name||!email||!phone||!pass){showToast('Please fill all required fields');return;}
  if(pass.length<8){showToast('Password must be at least 8 characters');return;}
  if(pass!==confirmPass){showToast('Passwords do not match');return;}
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){showToast('Please enter a valid email');return;}

  if(!termsChecked){
    const err=document.getElementById('terms-error');
    const cb=document.getElementById('reg-terms');
    const row=document.getElementById('terms-row');
    if(err) err.style.display='block';
    if(cb) cb.classList.add('error');
    if(row) row.style.borderColor='var(--danger)';
    showToast('You must agree to Terms & Conditions');
    document.getElementById('reg-terms')?.scrollIntoView({behavior:'smooth',block:'center'});
    return;
  }
  
  try {
    const { createUserWithEmailAndPassword } = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js');
    const userCredential = await createUserWithEmailAndPassword(window.firebaseAuth, email, pass);
    const user = userCredential.user;
    
    const { doc, setDoc } = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js');
    const newUserProfile = {
      name, email, phone, address: document.getElementById('reg-address').value || '',
      bookings: 0, joined: new Date().toLocaleDateString('en-US', {month: 'short', year: 'numeric'}),
      status: 'active'
    };
    await setDoc(doc(window.firebaseDB, 'users', user.uid), newUserProfile);
    
    state.user = {id: user.uid, ...newUserProfile};
    state.userBookings = [];
    showToast('Account created! Welcome, ' + name.split(' ')[0] + ' 🎉');
    renderHome(); 
    setTimeout(()=>goScreen('home'),400);
  } catch (error) {
    showToast('❌ ' + (error.message || 'Registration failed'));
  }
}

async function doLogout(){
  try {
    const { signOut } = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js');
    await signOut(window.firebaseAuth);
    
    state.user=null; 
    state.userBookings=[]; 
    state.screenHistory=[];
    document.getElementById('login-email').value='';
    document.getElementById('login-password').value='';
    goScreen('login');
    showToast('Logged out');
  } catch (error) {
    showToast('Logout error: ' + error.message);
  }
}


// =====================================================================
//  BOOKING ENRICHMENT
//  Uses names stored in the booking document (from Firestore) first,
//  then falls back to the local DB cache.
// =====================================================================
function enrichBooking(b){
  // Try to match by Firestore string id first, then numeric fallback
  const svc = DB.getService(b.serviceId) || {name: b.serviceName||'Service', icon:'📋', category:'', price:'N/A'};
  const wrk = DB.getWorker(b.workerId) || {name: b.workerName||'Worker', avatar:'?', rating:0, jobs:0, verified:false};
  return {
    ...b,
    service: { icon: svc.icon||'📋', name: b.serviceName||svc.name, category: svc.category||'', price: svc.price||'N/A' },
    worker:  { name: b.workerName||wrk.name, avatar: wrk.avatar||'?', rating: wrk.rating||0, jobs: wrk.jobs||0, verified: wrk.verified||false }
  };
}

// =====================================================================
//  RENDER HOME  (loads content from Firestore)
// =====================================================================
async function renderHome(){
  // Load live content from Firestore then fall back to local
  const c = await FirebaseHelpers.loadContent();
  DB.updateContent(c); // keep local cache in sync

  const u=state.user;
  if(!u) return;
  const initials=u.name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase();
  const hour=new Date().getHours();
  const greet=hour<12?'Good morning,':hour<17?'Good afternoon,':'Good evening,';
  document.getElementById('home-greeting').textContent=greet;
  document.getElementById('home-username').textContent=u.name;
  document.getElementById('home-avatar').textContent=initials;

  // Stats
  document.getElementById('stat1-num').textContent=c.stat1Num;
  document.getElementById('stat1-lbl').textContent=c.stat1Lbl;
  document.getElementById('stat2-num').textContent=c.stat2Num;
  document.getElementById('stat2-lbl').textContent=c.stat2Lbl;
  document.getElementById('stat3-num').textContent=c.stat3Num;
  document.getElementById('stat3-lbl').textContent=c.stat3Lbl;

  // Promo
  document.getElementById('promo-label-el').textContent=c.promoLabel;
  document.getElementById('promo-title-el').textContent=c.promoTitle;
  document.getElementById('promo-sub-el').innerHTML='Use code <b>'+c.promoCode+'</b> at checkout';

  // App tagline (login screen)
  const tagEl = document.getElementById('app-tagline');
  if(tagEl) tagEl.textContent = c.tagline;

  // Load services from Firestore for display
  const allServices = await FirebaseHelpers.loadServices();
  DB.services = allServices; // sync local cache

  // Categories
  const CATS=[
    {name:'Plumbing',icon:'ic-wrench'},{name:'Electrical',icon:'ic-zap'},{name:'Cleaning',icon:'ic-broom'},
    {name:'Aircon',icon:'ic-wind'},{name:'Carpentry',icon:'ic-hammer'},{name:'Painting',icon:'ic-paintbrush'},
    {name:'Pest Control',icon:'ic-bug'},{name:'Appliance Repair',icon:'ic-appliance'}
  ];
  const visCats = c.visibleCategories || CATS.map(c=>c.name);
  document.getElementById('home-categories').innerHTML=CATS.filter(ct=>visCats.includes(ct.name)).map(ct=>`
    <div class="cat-card" onclick="openCategory('${ct.name}')">
      <div class="cat-icon-wrap">
        <svg width="22" height="22" fill="none" stroke="var(--brand)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><use href="#${ct.icon}"/></svg>
      </div>
      <div style="font-size:10px;font-weight:600;line-height:1.2;color:var(--text)">${ct.name.replace(' Repair','').replace(' Control','Ctrl')}</div>
    </div>`).join('');

  // Featured — match by string ID since Firestore uses string IDs
  const featIds = (c.featuredIds||[]).map(String);
  const featuredSvcs = allServices.filter(s=>(s.active!==false)&&featIds.includes(String(s.id))).slice(0,6);
  document.getElementById('featured-list').innerHTML=featuredSvcs.map(s=>`
    <div class="featured-card" onclick="openServiceDetail('${s.id}')">
      <div style="background:var(--brand-light);padding:18px;text-align:center;font-size:34px">${s.icon}</div>
      <div style="padding:10px 12px 12px">
        <div style="font-size:13px;font-weight:600;line-height:1.3">${s.name}</div>
        <div style="font-size:11px;color:var(--muted);margin-top:2px">${s.price}</div>
        <div style="display:flex;align-items:center;gap:4px;margin-top:5px">
          <span style="color:#FBBF24;font-size:11px">★</span>
          <span style="font-size:11px;font-weight:600">${s.rating}</span>
          <span style="font-size:11px;color:var(--muted)">(${s.reviews})</span>
        </div>
      </div>
    </div>`).join('');

  // Top Workers — load from Firestore
  const allWorkers = await FirebaseHelpers.loadWorkers();
  DB.workers = allWorkers;
  document.getElementById('top-workers-list').innerHTML=allWorkers
    .filter(w=>w.verified&&w.status==='active')
    .sort((a,b)=>b.rating-a.rating).slice(0,3)
    .map(w=>`
    <div class="worker-card">
      <div class="avatar" style="width:48px;height:48px">${w.avatar||(w.name||'?').split(' ').map(x=>x[0]).join('').slice(0,2).toUpperCase()}</div>
      <div style="flex:1;min-width:0">
        <div style="font-size:14px;font-weight:600">${w.name} ${w.verified?'<span class="badge badge-blue" style="font-size:10px">✓</span>':''}</div>
        <div style="font-size:12px;color:var(--muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${(w.categories||[]).join(', ')}</div>
        <div style="display:flex;align-items:center;gap:6px;margin-top:3px">
          <span style="color:#FBBF24;font-size:12px">★</span>
          <span style="font-size:12px;font-weight:600">${w.rating}</span>
          <span style="color:var(--muted);font-size:12px">${w.jobs} jobs</span>
        </div>
      </div>
      <div style="font-size:12px;font-weight:700;color:var(--brand);flex-shrink:0">${w.price}</div>
    </div>`).join('');
}

// =====================================================================
//  SEARCH
// =====================================================================
function openSearch(){
  document.getElementById('search-modal').classList.add('open');
  setTimeout(()=>{
    const inp=document.getElementById('search-input');
    inp.value=''; inp.focus();
    document.getElementById('search-results').innerHTML='';
  },100);
}

function closeSearch(){ document.getElementById('search-modal').classList.remove('open'); }

function doSearch(q){
  const results=DB.getServices().filter(s=>s.active!==false&&(s.name.toLowerCase().includes(q.toLowerCase())||s.category.toLowerCase().includes(q.toLowerCase())));
  document.getElementById('search-results').innerHTML=q.length<2?
    '<div style="text-align:center;padding:20px;color:var(--muted);font-size:13px">Type to search services...</div>':
    results.length===0?'<div style="text-align:center;padding:20px;color:var(--muted);font-size:13px">No services found for "'+q+'"</div>':
    results.map(s=>`
    <div style="display:flex;align-items:center;gap:12px;padding:12px;border-radius:var(--radius-sm);cursor:pointer;transition:.15s;border:1px solid var(--border);margin-bottom:8px" onclick="closeSearch();openServiceDetail('${s.id}')" onmouseover="this.style.background='var(--surface2)'" onmouseout="this.style.background=''">
      <span style="font-size:24px">${s.icon}</span>
      <div style="flex:1">
        <div style="font-size:14px;font-weight:600">${s.name}</div>
        <div style="font-size:12px;color:var(--muted)">${s.category} · ${s.price}</div>
      </div>
    </div>`).join('');
}

// =====================================================================
//  SERVICES
// =====================================================================
function openCategory(cat){
  state.screenHistory.push(state.screen);
  document.getElementById('services-title').textContent=cat?cat+' Services':'All Services';
  const items=DB.getServices().filter(s=>s.active!==false&&(cat===''||s.category===cat));
  document.getElementById('services-list').innerHTML=items.length===0?
    '<div style="text-align:center;padding:48px;color:var(--muted)">No services in this category yet.</div>':
    items.map(s=>`
    <div class="service-card" onclick="openServiceDetail('${s.id}')">
      <div style="display:flex;align-items:center;gap:14px">
        <div style="font-size:36px;flex-shrink:0">${s.icon}</div>
        <div style="flex:1;min-width:0">
          <div style="font-size:15px;font-weight:600">${s.name}</div>
          <div style="font-size:12px;color:var(--muted);margin-top:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${s.desc}</div>
          <div style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap">
            <span class="badge badge-blue">${s.price}</span>
            <span class="badge badge-gray">⏱ ${s.duration}</span>
            <span class="badge badge-yellow">★ ${s.rating}</span>
          </div>
        </div>
        <div style="color:var(--muted);font-size:18px;flex-shrink:0">›</div>
      </div>
    </div>`).join('');
  goScreen('services');
}

function openServiceDetail(id){
  const s=DB.getService(id);
  if(!s){showToast('Service not found');return;}
  state.selectedService=s;
  document.getElementById('service-detail-content').innerHTML=`
    <div style="text-align:center;background:linear-gradient(135deg,var(--brand-light),var(--surface3));border-radius:var(--radius);padding:32px;margin-bottom:14px;font-size:72px">${s.icon}</div>
    <div class="card">
      <div style="font-size:21px;font-weight:700;margin-bottom:4px">${s.name}</div>
      <div style="font-size:13px;color:var(--muted);margin-bottom:12px">${s.category}</div>
      <div style="font-size:14px;line-height:1.65;margin-bottom:14px;color:var(--muted)">${s.desc}</div>
      <div class="divider"></div>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;text-align:center">
        <div style="background:var(--surface2);padding:10px 6px;border-radius:var(--radius-sm)"><div style="font-size:13px;font-weight:700;color:var(--brand)">${s.price}</div><div style="font-size:10px;color:var(--muted);margin-top:2px">Price</div></div>
        <div style="background:var(--surface2);padding:10px 6px;border-radius:var(--radius-sm)"><div style="font-size:13px;font-weight:700;color:var(--brand)">${s.duration}</div><div style="font-size:10px;color:var(--muted);margin-top:2px">Duration</div></div>
        <div style="background:var(--surface2);padding:10px 6px;border-radius:var(--radius-sm)"><div style="font-size:13px;font-weight:700;color:#FBBF24">★ ${s.rating}</div><div style="font-size:10px;color:var(--muted);margin-top:2px">${s.reviews} reviews</div></div>
      </div>
    </div>
    <div class="card" style="margin-top:12px">
      <div class="section-title">What's Included</div>
      <ul style="color:var(--muted);font-size:14px;line-height:2.2;list-style:none">
        <li>✅ Professional &amp; verified worker</li>
        <li>✅ Tools and equipment provided</li>
        <li>✅ Service satisfaction guarantee</li>
        <li>✅ 20% platform service fee included</li>
      </ul>
    </div>
    <div style="margin-top:14px">
      <button class="btn btn-primary btn-full" style="padding:15px" onclick="startBooking('${s.id}')">Book Now →</button>
    </div>`;
  goScreen('service-detail');
}

// =====================================================================
//  BOOKING FLOW
// =====================================================================
function startBooking(id){
  if(!state.user){showToast('Please login to book a service');return;}
  if(state.user.id==='GUEST'){showToast('Please create an account to book a service');return;}
  const s=DB.getService(id);
  if(!s){showToast('Service not found');return;}
  state.selectedService=s;
  const today=new Date().toISOString().split('T')[0];
  document.getElementById('booking-date').min=today;
  document.getElementById('booking-date').value=today;
  document.getElementById('booking-location').value=state.user.address||'';
  document.getElementById('booking-promo').value='';
  document.getElementById('booking-notes').value='';
  document.getElementById('booking-service-summary').innerHTML=`
    <div style="display:flex;align-items:center;gap:12px">
      <div style="font-size:32px">${s.icon}</div>
      <div>
        <div style="font-size:15px;font-weight:600">${s.name}</div>
        <div style="font-size:12px;color:var(--muted)">${s.price} · ${s.duration}</div>
        <span class="badge badge-blue" style="margin-top:4px">${s.category}</span>
      </div>
    </div>`;
  goScreen('booking');
}

function findWorker(){
  const date=document.getElementById('booking-date').value;
  const time=document.getElementById('booking-time').value;
  const loc=document.getElementById('booking-location').value.trim();
  const notes=document.getElementById('booking-notes').value;
  const promo=document.getElementById('booking-promo').value.trim();
  if(!date){showToast('Please select a date');return;}
  if(!loc){showToast('Please enter your service location');return;}
  state.bookingData={date,time,location:loc,notes,promo};
  goScreen('worker-matching');
  document.getElementById('worker-match-loading').style.display='block';
  document.getElementById('worker-match-list').style.display='none';
  setTimeout(()=>{
    const available=DB.getWorkers().filter(w=>w.status==='active'&&w.verified&&(w.categories||[]).some(c=>c===state.selectedService.category));
    document.getElementById('worker-match-loading').style.display='none';
    document.getElementById('worker-match-list').style.display='block';
    document.getElementById('worker-match-list').innerHTML=available.length===0?
      '<div style="text-align:center;padding:40px;color:var(--muted)">No available workers right now. Try again later.</div>':
      available.map(w=>`
      <div class="card" style="margin-bottom:10px">
        <div style="display:flex;align-items:center;gap:12px">
          <div class="avatar" style="width:52px;height:52px;font-size:18px">${w.avatar||(w.name||'?').split(' ').map(x=>x[0]).join('').slice(0,2).toUpperCase()}</div>
          <div style="flex:1;min-width:0">
            <div style="font-size:14px;font-weight:600">${w.name} ${w.verified?'<span class="badge badge-blue" style="font-size:10px">✓</span>':''}</div>
            <div style="font-size:12px;color:var(--muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${(w.categories||[]).join(', ')}</div>
            <div style="display:flex;align-items:center;gap:8px;margin-top:5px">
              <span style="color:#FBBF24;font-size:13px">★</span><span style="font-size:13px;font-weight:600">${w.rating}</span>
              <span style="font-size:12px;color:var(--muted)">${w.jobs} jobs</span>
            </div>
          </div>
          <div style="text-align:right;flex-shrink:0">
            <div style="font-size:13px;font-weight:700;color:var(--brand)">${w.price}</div>
            <button class="btn btn-primary btn-sm" style="margin-top:8px" onclick="selectWorker('${w.id}')">Select</button>
          </div>
        </div>
      </div>`).join('');
  },1800);
}

function selectWorker(id){
  state.selectedWorker=DB.getWorker(id);
  renderConfirmation();
  goScreen('confirmation');
}

function renderConfirmation(){
  const s=state.selectedService;
  const w=state.selectedWorker;
  const bd=state.bookingData;
  const c=DB.getContent();
  let basePrice=parseInt(s.price.replace('₱','').split('–')[0].replace(/,/g,''));
  const discount=bd.promo&&bd.promo.toUpperCase()===c.promoCode?Math.round(basePrice*0.2):0;
  const commission=Math.round((basePrice-discount)*0.2);
  const total=basePrice-discount+commission;
  document.getElementById('confirmation-content').innerHTML=`
    <div class="card">
      <div class="section-title">Service Summary</div>
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px">
        <span style="font-size:32px">${s.icon}</span>
        <div><div style="font-weight:600">${s.name}</div><div style="font-size:13px;color:var(--muted)">${s.category}</div></div>
      </div>
      <div class="divider"></div>
      <div style="font-size:13px;line-height:2">
        <div style="display:flex;justify-content:space-between"><span style="color:var(--muted)">📅 Date</span><span style="font-weight:500">${fmtDate(bd.date)}</span></div>
        <div style="display:flex;justify-content:space-between"><span style="color:var(--muted)">🕐 Time</span><span style="font-weight:500">${bd.time}</span></div>
        <div style="display:flex;justify-content:space-between"><span style="color:var(--muted)">📍 Location</span><span style="font-weight:500;text-align:right;max-width:55%">${bd.location}</span></div>
      </div>
    </div>
    <div class="card" style="margin-top:12px">
      <div class="section-title">Assigned Worker</div>
      <div style="display:flex;align-items:center;gap:12px">
        <div class="avatar" style="width:52px;height:52px">${w.avatar||(w.name||'?').split(' ').map(x=>x[0]).join('').slice(0,2).toUpperCase()}</div>
        <div>
          <div style="font-weight:600">${w.name}</div>
          <div style="font-size:13px;color:var(--muted)">★ ${w.rating} · ${w.jobs} jobs</div>
        </div>
      </div>
    </div>
    <div class="card" style="margin-top:12px">
      <div class="section-title">Payment Summary</div>
      <div style="font-size:13px;line-height:2.2">
        <div style="display:flex;justify-content:space-between"><span style="color:var(--muted)">Service Fee</span><span>₱${basePrice.toLocaleString()}</span></div>
        ${discount?`<div style="display:flex;justify-content:space-between;color:var(--success)"><span>Promo Discount (${c.promoCode})</span><span>−₱${discount.toLocaleString()}</span></div>`:''}
        <div style="display:flex;justify-content:space-between"><span style="color:var(--muted)">Platform Fee (20%)</span><span>₱${commission.toLocaleString()}</span></div>
        <div style="height:1px;background:var(--border);margin:8px 0"></div>
        <div style="display:flex;justify-content:space-between;font-size:16px;font-weight:700"><span>Total</span><span style="color:var(--brand)">₱${total.toLocaleString()}</span></div>
      </div>
    </div>
    <div style="margin-top:16px"><button class="btn btn-primary btn-full" style="padding:15px" onclick="confirmBooking(${total})">✅ Confirm Booking</button></div>`;
}

async function confirmBooking(total) {
  const s = state.selectedService;
  const w = state.selectedWorker;
  const bd = state.bookingData;

  const bookingData = {
    serviceId: String(s.id),
    serviceName: s.name,
    serviceIcon: s.icon || '📋',
    serviceCategory: s.category,
    workerId: String(w.id),
    workerName: w.name,
    customerId: state.user.id,
    customerName: state.user.name,
    date: bd.date,
    time: bd.time,
    location: bd.location,
    notes: bd.notes || '',
    price: total,
    status: 'pending',
    rated: false,
    createdAt: new Date().toISOString()
  };

  showToast('Sending request to cloud...');

  const bookingId = await FirebaseHelpers.createBooking(bookingData);

  if (bookingId) {
    state.userBookings = await FirebaseHelpers.loadBookings(state.user.id);
    state.userBookings = state.userBookings.map(enrichBooking);
    showToast('✅ Booking confirmed and synced!');
    renderBookings(); 
    setTimeout(() => goToTab('bookings'), 1500);
  } else {
    showToast('❌ Failed to save booking to Firebase');
  }
}

// =====================================================================
//  BOOKINGS LIST
// =====================================================================
async function renderBookings() {
  if (!state.user) return;
  
  const bookings = await FirebaseHelpers.loadBookings(state.user.id);
  state.userBookings = bookings.map(enrichBooking);
  
  filterBookings(state.bookingFilter || 'all');
}

function filterBookings(f){
  state.bookingFilter=f;
  ['all','upcoming','completed'].forEach(id=>{
    const btn=document.getElementById('tab-'+id);
    if(!btn) return;
    btn.style.background=f===id?'var(--brand)':'transparent';
    btn.style.color=f===id?'#fff':'var(--muted)';
    btn.style.borderColor=f===id?'transparent':'var(--border)';
  });
  let list=state.userBookings;
  if(f==='upcoming') list=list.filter(b=>b.status==='upcoming'||b.status==='pending'||b.status==='accepted');
  else if(f==='completed') list=list.filter(b=>b.status==='completed'||b.status==='cancelled');
  const el=document.getElementById('bookings-list');
  el.innerHTML=list.length===0?
    `<div style="text-align:center;padding:60px 20px;color:var(--muted)">
      <div style="font-size:48px;margin-bottom:12px">📋</div>
      <div style="font-weight:600;margin-bottom:8px">No bookings yet</div>
      <div style="font-size:13px;margin-bottom:20px">Book a service to get started</div>
      <button class="btn btn-primary btn-sm" onclick="goToTab('home')">Browse Services</button>
    </div>`:
    list.map(b=>`
    <div class="card" style="margin-bottom:10px;cursor:pointer" onclick="openBookingDetail('${b.id}')">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:10px">
        <div style="font-size:28px">${b.service.icon||'📋'}</div>
        <div style="flex:1;min-width:0">
          <div style="font-size:14px;font-weight:600">${b.service.name}</div>
          <div style="font-size:12px;color:var(--muted)">${fmtDate(b.date)}</div>
        </div>
        ${statusBadge(b.status)}
      </div>
      <div style="display:flex;align-items:center;gap:8px;font-size:13px;color:var(--muted)">
        <span>👷 ${b.worker.name}</span>
        <span>·</span>
        <span style="color:var(--brand);font-weight:600">₱${(b.price||0).toLocaleString()}</span>
      </div>
      ${b.status==='completed'&&!b.rated?`<div style="margin-top:10px"><button class="btn btn-secondary btn-sm btn-full" onclick="event.stopPropagation();openRating('${b.id}')">⭐ Rate this service</button></div>`:''}`).join('');
}

function openBookingDetail(id){
  const b=state.userBookings.find(x=>x.id===id)||enrichBooking(DB.getBooking(id)||{id,service:{},worker:{}});
  if(!b){showToast('Booking not found');return;}
  document.getElementById('booking-detail-content').innerHTML=`
    <div class="card">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px">
        <div>
          <div style="font-size:10px;color:var(--muted);text-transform:uppercase;letter-spacing:.5px">Reference</div>
          <div style="font-size:14px;font-weight:700;color:var(--brand)">${String(b.id).slice(-8).toUpperCase()}</div>
        </div>
        ${statusBadge(b.status)}
      </div>
      <div class="divider"></div>
      <div style="display:flex;align-items:center;gap:12px;margin:12px 0">
        <span style="font-size:32px">${b.service.icon||'📋'}</span>
        <div>
          <div style="font-weight:600">${b.service.name}</div>
          <div style="font-size:13px;color:var(--muted)">${b.service.category||''}</div>
        </div>
      </div>
      <div class="divider"></div>
      <div style="font-size:13px;line-height:2.2">
        <div style="display:flex;justify-content:space-between"><span style="color:var(--muted)">📅 Date</span><span>${fmtDate(b.date)}</span></div>
        <div style="display:flex;justify-content:space-between"><span style="color:var(--muted)">🕐 Time</span><span>${b.time}</span></div>
        <div style="display:flex;justify-content:space-between"><span style="color:var(--muted)">📍 Location</span><span style="text-align:right;max-width:55%">${b.location}</span></div>
        <div style="display:flex;justify-content:space-between;font-weight:700"><span>💰 Total</span><span style="color:var(--brand)">₱${(b.price||0).toLocaleString()}</span></div>
      </div>
    </div>
    <div class="card" style="margin-top:12px">
      <div class="section-title">Worker</div>
      <div style="display:flex;align-items:center;gap:12px">
        <div class="avatar" style="width:48px;height:48px">${b.worker.avatar||'?'}</div>
        <div>
          <div style="font-weight:600">${b.worker.name}</div>
          <div style="font-size:13px;color:var(--muted)">★ ${b.worker.rating} · ${b.worker.jobs} jobs</div>
        </div>
      </div>
    </div>
    ${b.notes?`<div class="card" style="margin-top:12px"><div class="section-title">Notes</div><div style="font-size:13px;color:var(--muted)">${b.notes}</div></div>`:''}
    ${b.status==='completed'&&!b.rated?`<div style="margin-top:14px"><button class="btn btn-primary btn-full" onclick="openRating('${b.id}')">⭐ Rate this Service</button></div>`:''}
    ${b.status==='upcoming'||b.status==='pending'?`<div style="margin-top:14px"><button class="btn btn-danger btn-full" onclick="cancelBooking('${b.id}')">Cancel Booking</button></div>`:''}`;
  goScreen('booking-detail');
}

async function cancelBooking(id){
  if(!confirm('Cancel this booking?')) return;
  const success = await FirebaseHelpers.updateBookingStatus(id, 'cancelled');
  if(success){
    showToast('Booking cancelled');
    state.userBookings = await FirebaseHelpers.loadBookings(state.user.id);
    state.userBookings = state.userBookings.map(enrichBooking);
  } else {
    showToast('Failed to cancel booking');
  }
  goBack(); renderBookings();
}

// =====================================================================
//  RATING
// =====================================================================
function openRating(bookingId){
  const b=state.userBookings.find(x=>x.id===bookingId)||enrichBooking(DB.getBooking(bookingId)||{id:bookingId,service:{icon:'📋',name:'Service'},worker:{name:'Worker'}});
  document.getElementById('rating-content').innerHTML=`
    <div class="card" style="text-align:center;margin-bottom:16px">
      <div style="font-size:48px;margin-bottom:8px">${b.service.icon||'📋'}</div>
      <div style="font-size:17px;font-weight:700">${b.service.name}</div>
      <div style="font-size:13px;color:var(--muted);margin-top:4px">by ${b.worker.name}</div>
    </div>
    <div class="card">
      <div class="section-title">How was your experience?</div>
      <div id="star-row" style="display:flex;justify-content:center;gap:12px;margin:20px 0;font-size:40px">
        ${[1,2,3,4,5].map(i=>`<span style="cursor:pointer;opacity:.4;transition:.15s" onclick="selectStar(${i})" id="star-${i}">★</span>`).join('')}
      </div>
      <div id="rating-label" style="text-align:center;font-size:14px;color:var(--muted);margin-bottom:16px">Tap a star to rate</div>
      <textarea id="rating-comment" rows="3" placeholder="Tell us about your experience... (optional)"></textarea>
      <div style="margin-top:14px">
        <button class="btn btn-primary btn-full" onclick="submitRating('${bookingId}')">Submit Rating</button>
      </div>
    </div>`;
  window._ratingSelected=0;
  window._ratingBookingRef=b;
  const sc=document.getElementById('screen-rating');
  sc.classList.add('active');
  state.prevScreen=state.screen;
}

function selectStar(n){
  window._ratingSelected=n;
  const labels=['','😞 Poor','😐 Fair','🙂 Good','😊 Great','🤩 Excellent!'];
  document.getElementById('rating-label').textContent=labels[n];
  for(let i=1;i<=5;i++){
    const s=document.getElementById('star-'+i);
    s.style.opacity=i<=n?'1':'.25';
    s.style.color=i<=n?'#FBBF24':'inherit';
  }
}

async function submitRating(bookingId){
  const n=window._ratingSelected;
  if(!n){showToast('Please select a star rating');return;}
  const b = window._ratingBookingRef;
  const comment = document.getElementById('rating-comment').value.trim();

  // 1. Mark booking as rated in Firestore
  const { doc, updateDoc } = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js');
  try {
    await updateDoc(doc(window.firebaseDB, 'bookings', bookingId), { rated: true, userRating: n });
  } catch(e) { console.warn('Could not mark booking rated:', e); }

  // 2. Save review to Firestore
  if(b && state.user) {
    try {
      await FirebaseHelpers.createReview({
        bookingId,
        workerId: String(b.workerId || b.worker?.id || ''),
        userId: state.user.id,
        userName: state.user.name,
        workerName: b.worker?.name || b.workerName || 'Worker',
        service: b.service?.name || b.serviceName || 'Service',
        rating: n,
        text: comment || '',
        date: new Date().toISOString().split('T')[0],
        flagged: false
      });
    } catch(e) { console.warn('Could not save review:', e); }
  }

  // 3. Update local state
  const localB = state.userBookings.find(x=>x.id===bookingId);
  if(localB){ localB.rated=true; localB.userRating=n; }
  
  showToast('Thank you for your rating! ⭐');
  closeRatingScreen();
  renderBookings();
}

// =====================================================================
//  PROFILE
// =====================================================================
function renderProfile() {
  const u = state.user;
  if (!u) return;

  const initials = u.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  document.getElementById('profile-avatar').textContent = initials;
  document.getElementById('profile-name').textContent = u.name;
  document.getElementById('profile-email').textContent = u.email;
  document.getElementById('profile-phone').textContent = u.phone || 'No phone set';
  
  const cnt = state.userBookings.length;
  document.getElementById('profile-booking-count').textContent = cnt;

  document.getElementById('edit-name').value = u.name;
  document.getElementById('edit-phone').value = u.phone || '';
  document.getElementById('edit-address').value = u.address || '';
}

async function saveProfile() {
  const name = document.getElementById('edit-name').value.trim();
  const phone = document.getElementById('edit-phone').value.trim();
  const address = document.getElementById('edit-address').value.trim();

  if (!name) { showToast('Name cannot be empty'); return; }

  const updatedData = { name, phone, address };

  if (state.user && state.user.id && state.user.id !== 'GUEST') {
    const success = await FirebaseHelpers.updateUserData(state.user.id, updatedData);
    if (success) {
      state.user = { ...state.user, ...updatedData };
      renderProfile();
      syncUser();
      showToast('Profile saved to Cloud ✅');
    } else {
      showToast('Firebase update failed ❌');
    }
  } else {
    state.user.name = name;
    state.user.phone = phone;
    state.user.address = address;
    renderProfile();
    syncUser();
    showToast('Saved locally (Guest)');
  }
}

// =====================================================================
//  ADMIN NAVIGATION
// =====================================================================
function toggleMobileSidebar(){
  const sb=document.getElementById('admin-sidebar');
  const oc=document.getElementById('admin-overlay-close');
  sb.classList.toggle('open');
  oc.classList.toggle('visible');
}

function closeMobileSidebar(){
  document.getElementById('admin-sidebar').classList.remove('open');
  document.getElementById('admin-overlay-close').classList.remove('visible');
}

function openAdmin(){
  document.getElementById('admin-login-modal').classList.add('open');
  setTimeout(()=>document.getElementById('admin-login-email').focus(),100);
}

function submitAdminLogin(){
  const email=document.getElementById('admin-login-email').value.trim();
  const pass=document.getElementById('admin-login-pass').value;
  if(DB.isAdmin(email,pass)){
    document.getElementById('admin-login-modal').classList.remove('open');
    document.getElementById('admin-view').classList.add('open');
    switchAdminTab('dashboard');
    showAdminMenuBtn();
  } else {
    showToast('❌ Invalid admin credentials');
  }
}

function showAdminMenuBtn(){
  const btn=document.getElementById('admin-menu-btn');
  if(window.innerWidth<768) btn.style.display='flex';
}

function closeAdmin(){
  document.getElementById('admin-view').classList.remove('open');
  closeMobileSidebar();
}

function switchAdminTab(tab){
  closeMobileSidebar();
  document.querySelectorAll('.admin-nav-item').forEach(el=>el.classList.remove('active'));
  const tabs={dashboard:'Dashboard',services:'Services',bookings:'Bookings',workers:'Workers',users:'Users',reviews:'Reviews',content:'Site Content',revenue:'Revenue'};
  document.querySelectorAll('.admin-nav-item').forEach(el=>{
    if(el.dataset.tab===tab) el.classList.add('active');
  });
  document.querySelectorAll('.admin-panel').forEach(el=>el.classList.remove('active'));
  const panel=document.getElementById('admin-'+tab);
  if(panel) panel.classList.add('active');
  document.getElementById('admin-page-title').textContent=tabs[tab]||tab;
  const renders={
    dashboard:renderAdminDashboard,services:renderAdminServices,bookings:renderAdminBookings,
    workers:renderAdminWorkers,users:renderAdminUsers,reviews:renderAdminReviews,
    content:renderAdminContent,revenue:renderAdminRevenue
  };
  if(renders[tab]) renders[tab]();
}

// =====================================================================
//  ADMIN — DASHBOARD  (fully live from Firestore)
// =====================================================================
async function renderAdminDashboard() {
  const [allBookings, allWorkers, allUsers, allReviews] = await Promise.all([
    FirebaseHelpers.loadAllBookings(),
    FirebaseHelpers.loadWorkers(),
    FirebaseHelpers.loadUsers(),
    FirebaseHelpers.loadReviews()
  ]);

  // Sync local caches
  DB.workers = allWorkers;
  DB.users = allUsers;
  DB.reviews = allReviews;

  const completed = allBookings.filter(b=>b.status==='completed');
  const revenue = completed.reduce((s,b)=>s+(Number(b.price)||0),0);
  const activeWorkers = allWorkers.filter(w=>w.status==='active').length;
  const avgRating = allReviews.length ? (allReviews.reduce((s,r)=>s+(Number(r.rating)||0),0)/allReviews.length).toFixed(1) : '0.0';

  document.getElementById('dashboard-kpis').innerHTML = `
    <div class="kpi-card"><div class="kpi-val">${allBookings.length}</div><div class="kpi-label">Total Bookings</div></div>
    <div class="kpi-card green"><div class="kpi-val">₱${revenue.toLocaleString()}</div><div class="kpi-label">Total Revenue</div></div>
    <div class="kpi-card orange"><div class="kpi-val">${activeWorkers}</div><div class="kpi-label">Active Workers</div></div>
    <div class="kpi-card"><div class="kpi-val">${avgRating}★</div><div class="kpi-label">Avg Rating</div></div>`;

  // Category chart
  const cats=['Plumbing','Electrical','Cleaning','Aircon','Carpentry','Painting','Pest Control','Appliance Repair'];
  const catCounts = cats.map(c=>({name:c, count: allBookings.filter(b=>b.serviceCategory===c||b.serviceName?.toLowerCase().includes(c.toLowerCase())).length}));
  const maxCat = Math.max(1,...catCounts.map(c=>c.count));
  document.getElementById('cat-chart').innerHTML=`
    <div style="display:flex;align-items:flex-end;gap:6px;height:120px;padding-top:10px">
      ${catCounts.map(c=>`
      <div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:4px">
        <div style="font-size:10px;font-weight:600;color:var(--brand)">${c.count}</div>
        <div style="width:100%;background:var(--brand);border-radius:4px 4px 0 0;height:${Math.max(4,Math.round(c.count/maxCat*80))}px"></div>
        <div style="font-size:9px;color:var(--muted);text-align:center;line-height:1.1">${c.name.split(' ')[0]}</div>
      </div>`).join('')}
    </div>`;

  // Recent activity
  document.getElementById('recent-activity').innerHTML = allBookings.slice(0,5).map(b=>`
    <div style="display:flex;align-items:center;gap:8px;padding:8px 0;border-bottom:1px solid var(--border);font-size:12px">
      <span style="font-size:18px">${b.serviceIcon||'📋'}</span>
      <div style="flex:1;min-width:0">
        <div style="font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${b.serviceName||'Service'}</div>
        <div style="color:var(--muted)">${b.customerName||'User'}</div>
      </div>
      ${statusBadge(b.status)}
    </div>`).join('');

  // Recent table
  document.getElementById('dashboard-recent-table').innerHTML = `
    <thead><tr><th>ID</th><th>Service</th><th>Customer</th><th>Status</th><th>Amount</th></tr></thead>
    <tbody>${allBookings.slice(0,6).map(b=>`
      <tr>
        <td style="font-weight:600;color:var(--brand)">${String(b.id).slice(-6).toUpperCase()}</td>
        <td>${b.serviceName||'—'}</td>
        <td>${b.customerName||'User'}</td>
        <td>${statusBadge(b.status)}</td>
        <td style="font-weight:600">₱${(b.price||0).toLocaleString()}</td>
      </tr>`).join('')}
    </tbody>`;
}

// =====================================================================
//  ADMIN — SERVICES  (fully live from Firestore)
// =====================================================================
async function renderAdminServices(){
  const q=(document.getElementById('service-search').value||'').toLowerCase();
  const cat=document.getElementById('service-cat-filter').value;

  let items = await FirebaseHelpers.loadServices();
  DB.services = items; // sync cache

  // Populate category filter
  const cats=[...new Set(items.map(s=>s.category))];
  const curVal=document.getElementById('service-cat-filter').value;
  document.getElementById('service-cat-filter').innerHTML='<option value="">All Categories</option>'+cats.map(c=>`<option value="${c}" ${c===curVal?'selected':''}>${c}</option>`).join('');
  if(curVal) document.getElementById('service-cat-filter').value=curVal;

  if(q) items=items.filter(s=>s.name.toLowerCase().includes(q)||s.category.toLowerCase().includes(q));
  if(cat) items=items.filter(s=>s.category===cat);

  document.getElementById('services-count').textContent=items.length+' services';
  document.getElementById('admin-services-table').innerHTML=`
    <thead><tr><th>Icon</th><th>Name</th><th>Category</th><th>Price</th><th>Rating</th><th>Status</th><th>Actions</th></tr></thead>
    <tbody>${items.map(s=>`<tr>
      <td style="font-size:20px">${s.icon}</td>
      <td style="font-weight:600">${s.name}</td>
      <td>${s.category}</td>
      <td>${s.price}</td>
      <td>★ ${s.rating} <span style="color:var(--muted);font-size:11px">(${s.reviews})</span></td>
      <td><span class="badge ${s.active!==false?'badge-green':'badge-gray'}">${s.active!==false?'Active':'Inactive'}</span></td>
      <td><div class="action-btns">
        <button class="btn btn-secondary btn-sm" onclick="editService('${s.id}')">Edit</button>
        <button class="btn btn-danger btn-sm" onclick="confirmDelete('service','${s.id}','${s.name}')">Delete</button>
      </div></td>
    </tr>`).join('')}</tbody>`;
}

function openServiceModal(){ 
  document.getElementById('service-modal-title').textContent='Add New Service';
  document.getElementById('service-edit-id').value='';
  ['svc-name','svc-desc','svc-price','svc-duration'].forEach(id=>document.getElementById(id).value='');
  document.getElementById('svc-icon').value='🔧';
  document.getElementById('svc-rating').value='4.5';
  document.getElementById('svc-reviews').value='0';
  document.getElementById('service-modal').classList.add('open');
}

function closeServiceModal(){ document.getElementById('service-modal').classList.remove('open'); }

function editService(id){
  const s=DB.getService(id);
  if(!s) return;
  document.getElementById('service-modal-title').textContent='Edit Service';
  document.getElementById('service-edit-id').value=s.id;
  document.getElementById('svc-name').value=s.name;
  document.getElementById('svc-category').value=s.category;
  document.getElementById('svc-icon').value=s.icon;
  document.getElementById('svc-desc').value=s.desc;
  document.getElementById('svc-price').value=s.price;
  document.getElementById('svc-duration').value=s.duration;
  document.getElementById('svc-rating').value=s.rating;
  document.getElementById('svc-reviews').value=s.reviews;
  document.getElementById('service-modal').classList.add('open');
}

async function saveService(){
  const editId=document.getElementById('service-edit-id').value;
  const data={
    name:document.getElementById('svc-name').value.trim(),
    category:document.getElementById('svc-category').value,
    icon:document.getElementById('svc-icon').value||'🔧',
    desc:document.getElementById('svc-desc').value.trim(),
    price:document.getElementById('svc-price').value.trim(),
    duration:document.getElementById('svc-duration').value.trim(),
    rating:parseFloat(document.getElementById('svc-rating').value)||4.5,
    reviews:parseInt(document.getElementById('svc-reviews').value)||0,
    active:true
  };
  if(!data.name||!data.price||!data.duration){showToast('Please fill all required fields');return;}
  try {
    if(editId){ 
      await FirebaseHelpers.updateService(editId, data);
      DB.updateService(editId, data);
      showToast('Service updated ✅ — users will see the change live'); 
    } else { 
      const newId = await FirebaseHelpers.createService(data);
      DB.createService({...data, id: newId});
      showToast('Service added ✅ — now visible to all users'); 
    }
  } catch (e) {
    console.error('Firebase save error:', e);
    showToast('❌ Error saving service');
    return;
  }
  closeServiceModal(); 
  renderAdminServices();
}

// =====================================================================
//  ADMIN — BOOKINGS  (fully live from Firestore)
// =====================================================================
async function renderAdminBookings() {
  const q = (document.getElementById('booking-search').value || '').toLowerCase();
  const sf = document.getElementById('booking-status-filter').value;

  let items = await FirebaseHelpers.loadAllBookings();

  if (sf) items = items.filter(b => b.status === sf);
  if (q) items = items.filter(b => 
    String(b.id).toLowerCase().includes(q) || 
    (b.customerName||'').toLowerCase().includes(q) || 
    (b.serviceName||'').toLowerCase().includes(q)
  );

  document.getElementById('booking-count').textContent = items.length + ' bookings';
  document.getElementById('admin-bookings-table').innerHTML = `
    <thead><tr><th>ID</th><th>Service</th><th>Customer</th><th>Date</th><th>Status</th><th>Amount</th><th>Actions</th></tr></thead>
    <tbody>${items.map(b => `
      <tr>
        <td style="font-weight:600;color:var(--brand);font-size:11px">${String(b.id).slice(-6).toUpperCase()}</td>
        <td>${b.serviceName||'—'}</td>
        <td>${b.customerName||'—'}</td>
        <td>${fmtDate(b.date)}</td>
        <td>${statusBadge(b.status)}</td>
        <td style="font-weight:600">₱${(b.price||0).toLocaleString()}</td>
        <td><button class="btn btn-secondary btn-sm" onclick="openBookingStatusModal('${b.id}')">Update</button></td>
      </tr>`).join('')}
    </tbody>`;
}

async function openBookingStatusModal(id) {
  const allBookings = await FirebaseHelpers.loadAllBookings();
  const b = allBookings.find(x => x.id === id);
  
  if (!b) {
    showToast('Booking not found in database');
    return;
  }

  document.getElementById('booking-edit-id').value = id;
  document.getElementById('booking-status-info').innerHTML = `
    <b>${b.serviceName || 'Unknown Service'}</b> — ${fmtDate(b.date)}<br>
    Customer: ${b.customerName||'User'}<br>
    Current Status: ${statusBadge(b.status)}
  `;
  document.getElementById('booking-new-status').value = b.status;
  document.getElementById('booking-status-modal').classList.add('open');
}

function closeBookingModal(){ document.getElementById('booking-status-modal').classList.remove('open'); }

async function saveBookingStatus() {
  const id = document.getElementById('booking-edit-id').value;
  const ns = document.getElementById('booking-new-status').value;
  if (!id) return;

  try {
    const success = await FirebaseHelpers.updateBookingStatus(id, ns);
    if (success) {
      showToast('Booking status updated ✅ — user will see this change live');
      closeBookingModal(); 
      await renderAdminBookings();
      await renderAdminDashboard();
    } else {
      showToast('Failed to update Firebase ❌');
    }
  } catch (e) {
    console.error('Update error:', e);
    showToast('Error syncing status');
  }
}

// =====================================================================
//  ADMIN — WORKERS  (fully live from Firestore)
// =====================================================================
async function renderAdminWorkers(){
  const q=(document.getElementById('worker-search').value||'').toLowerCase();
  const sf=document.getElementById('worker-status-filter').value;
  let items = await FirebaseHelpers.loadWorkers();
  DB.workers = items;
  if(sf) items=items.filter(w=>w.status===sf);
  if(q) items=items.filter(w=>(w.name||'').toLowerCase().includes(q)||(w.categories||[]).join(' ').toLowerCase().includes(q));
  document.getElementById('workers-count').textContent=items.length+' workers';
  document.getElementById('admin-workers-table').innerHTML=`
    <thead><tr><th>Worker</th><th>Categories</th><th>Rating</th><th>Jobs</th><th>Rate</th><th>Status</th><th>Actions</th></tr></thead>
    <tbody>${items.map(w=>`<tr>
      <td>
        <div style="display:flex;align-items:center;gap:8px">
          <div class="avatar" style="width:32px;height:32px;font-size:11px">${w.avatar||((w.name||'?').split(' ').map(x=>x[0]).join('').slice(0,2).toUpperCase())}</div>
          <div>
            <div style="font-weight:600;font-size:13px">${w.name}</div>
            <div style="font-size:11px;color:var(--muted)">${w.email||''}</div>
          </div>
        </div>
      </td>
      <td style="font-size:12px">${(w.categories||[]).join(', ')}</td>
      <td>★ ${w.rating}</td>
      <td>${w.jobs}</td>
      <td>${w.price}</td>
      <td>
        <span class="badge ${w.status==='active'?'badge-green':w.status==='pending'?'badge-yellow':'badge-red'}">${w.status}</span>
        ${w.verified?'<span class="badge badge-blue" style="margin-left:4px">✓</span>':''}
      </td>
      <td><div class="action-btns">
        <button class="btn btn-secondary btn-sm" onclick="editWorker('${w.id}')">Edit</button>
        <button class="btn btn-danger btn-sm" onclick="confirmDelete('worker','${w.id}','${w.name}')">Delete</button>
      </div></td>
    </tr>`).join('')}</tbody>`;
}

function openWorkerModal(){
  document.getElementById('worker-modal-title').textContent='Add New Worker';
  document.getElementById('worker-edit-id').value='';
  ['w-name','w-email','w-phone'].forEach(id=>document.getElementById(id).value='');
  document.getElementById('w-rate').value='';
  document.getElementById('w-rating').value='4.5';
  document.getElementById('w-jobs').value='0';
  document.getElementById('w-status').value='active';
  document.getElementById('w-verified').value='true';
  renderWorkerCatCheckboxes([]);
  document.getElementById('worker-modal').classList.add('open');
}

function closeWorkerModal(){ document.getElementById('worker-modal').classList.remove('open'); }

function renderWorkerCatCheckboxes(selected){
  const cats=['Plumbing','Electrical','Cleaning','Aircon','Carpentry','Painting','Pest Control','Appliance Repair'];
  document.getElementById('worker-cat-checkboxes').innerHTML=cats.map(c=>`
    <label style="display:flex;align-items:center;gap:6px;font-size:13px;cursor:pointer;background:var(--surface2);padding:6px 10px;border-radius:6px;border:1.5px solid ${selected.includes(c)?'var(--brand)':'var(--border)'}">
      <input type="checkbox" value="${c}" ${selected.includes(c)?'checked':''} style="width:auto;accent-color:var(--brand)" onchange="this.closest('label').style.borderColor=this.checked?'var(--brand)':'var(--border)'">
      ${c}
    </label>`).join('');
}

function editWorker(id){
  const w=DB.workers.find(x=>String(x.id)===String(id));
  if(!w) return;
  document.getElementById('worker-modal-title').textContent='Edit Worker';
  document.getElementById('worker-edit-id').value=w.id;
  document.getElementById('w-name').value=w.name;
  document.getElementById('w-rate').value=w.price;
  document.getElementById('w-email').value=w.email||'';
  document.getElementById('w-phone').value=w.phone||'';
  document.getElementById('w-rating').value=w.rating;
  document.getElementById('w-jobs').value=w.jobs;
  document.getElementById('w-status').value=w.status;
  document.getElementById('w-verified').value=w.verified?'true':'false';
  renderWorkerCatCheckboxes(w.categories||[]);
  document.getElementById('worker-modal').classList.add('open');
}

async function saveWorker(){
  const editId=document.getElementById('worker-edit-id').value;
  const cats=[...document.querySelectorAll('#worker-cat-checkboxes input:checked')].map(cb=>cb.value);
  if(!cats.length){showToast('Select at least one category');return;}
  const name = document.getElementById('w-name').value.trim();
  const data={
    name,
    price:document.getElementById('w-rate').value.trim(),
    email:document.getElementById('w-email').value.trim(),
    phone:document.getElementById('w-phone').value.trim(),
    categories:cats,
    status:document.getElementById('w-status').value,
    verified:document.getElementById('w-verified').value==='true',
    rating:parseFloat(document.getElementById('w-rating').value)||4.5,
    jobs:parseInt(document.getElementById('w-jobs').value)||0,
    avatar: name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase()
  };
  if(!data.name||!data.price){showToast('Please fill Name and Rate');return;}
  try {
    const { doc, updateDoc, collection, addDoc } = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js');
    if(editId){ 
      await updateDoc(doc(window.firebaseDB, 'workers', editId), data);
      DB.updateWorker(editId, {...data, id: editId});
      showToast('Worker updated ✅ — visible to all users'); 
    } else { 
      const docRef = await addDoc(collection(window.firebaseDB, 'workers'), data);
      DB.workers.push({...data, id: docRef.id});
      showToast('Worker added ✅ — visible to all users'); 
    }
  } catch (e) {
    console.error('Firebase save error:', e);
    showToast('❌ Error saving worker');
    return;
  }
  closeWorkerModal(); 
  renderAdminWorkers();
}

// =====================================================================
//  ADMIN — USERS  (fully live from Firestore)
// =====================================================================
async function renderAdminUsers(){
  const q=(document.getElementById('user-search').value||'').toLowerCase();
  const sf=document.getElementById('user-status-filter').value;
  
  let items = await FirebaseHelpers.loadUsers();
  DB.users = items; // sync cache

  if(sf) items=items.filter(u=>u.status===sf);
  if(q) items=items.filter(u=>(u.name||'').toLowerCase().includes(q)||(u.email||'').toLowerCase().includes(q));
  document.getElementById('users-count').textContent=items.length+' users';
  document.getElementById('admin-users-table').innerHTML=`
    <thead><tr><th>User</th><th>Phone</th><th>Joined</th><th>Status</th><th>Actions</th></tr></thead>
    <tbody>${items.map(u=>`<tr>
      <td>
        <div style="font-weight:600">${u.name||'—'}</div>
        <div style="font-size:11px;color:var(--muted)">${u.email||'—'}</div>
      </td>
      <td>${u.phone||'—'}</td>
      <td>${u.joined||'—'}</td>
      <td><span class="badge ${u.status==='active'?'badge-green':'badge-red'}">${u.status||'active'}</span></td>
      <td><div class="action-btns">
        <button class="btn btn-secondary btn-sm" onclick="viewUser('${u.id}')">View</button>
        ${u.status==='active'?
          `<button class="btn btn-danger btn-sm" onclick="toggleUser('${u.id}','disable')">Disable</button>`:
          `<button class="btn btn-success btn-sm" onclick="toggleUser('${u.id}','enable')">Enable</button>`}
      </div></td>
    </tr>`).join('')}</tbody>`;
}

async function toggleUser(id, action){
  const newStatus = action === 'disable' ? 'disabled' : 'active';
  const success = await FirebaseHelpers.setUserStatus(id, newStatus);
  if(success){
    // Update local cache
    const u = DB.users.find(x=>x.id===id);
    if(u) u.status = newStatus;
    showToast(`User ${action}d ✅`);
    renderAdminUsers();
  } else {
    showToast('❌ Failed to update user status');
  }
}

function viewUser(id){
  const u=DB.users.find(x=>x.id===id);
  if(!u) return;
  document.getElementById('user-modal-content').innerHTML=`
    <div style="display:flex;align-items:center;gap:14px;margin-bottom:16px">
      <div class="avatar" style="width:52px;height:52px">${(u.name||'?').split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase()}</div>
      <div>
        <div style="font-weight:700;font-size:15px">${u.name||'—'}</div>
        <div style="font-size:13px;color:var(--muted)">${u.email||'—'}</div>
      </div>
    </div>
    <div style="font-size:13px;line-height:2.2">
      <div><span style="color:var(--muted)">Phone:</span> ${u.phone||'—'}</div>
      <div><span style="color:var(--muted)">Address:</span> ${u.address||'—'}</div>
      <div><span style="color:var(--muted)">Joined:</span> ${u.joined||'—'}</div>
      <div><span style="color:var(--muted)">Status:</span> ${statusBadge(u.status||'active')}</div>
    </div>`;
  document.getElementById('user-view-modal').classList.add('open');
}

function closeUserModal(){ document.getElementById('user-view-modal').classList.remove('open'); }

// =====================================================================
//  ADMIN — REVIEWS  (fully live from Firestore)
// =====================================================================
async function renderAdminReviews(){
  const q=(document.getElementById('review-search').value||'').toLowerCase();
  const f=document.getElementById('review-filter').value;
  
  let items = await FirebaseHelpers.loadReviews();
  DB.reviews = items;

  if(f==='flagged') items=items.filter(r=>r.flagged);
  else if(f==='low') items=items.filter(r=>r.rating<=2);
  else if(f==='high') items=items.filter(r=>r.rating===5);
  if(q) items=items.filter(r=>(r.text||'').toLowerCase().includes(q)||(r.userName||'').toLowerCase().includes(q)||(r.workerName||'').toLowerCase().includes(q));
  
  document.getElementById('admin-reviews-list').innerHTML=items.length===0?
    '<div style="text-align:center;padding:40px;color:var(--muted)">No reviews found.</div>':
    items.map(r=>`
    <div class="review-card ${r.flagged?'flagged':''}">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px;flex-wrap:wrap;gap:8px">
        <div>
          <div style="font-weight:600;font-size:14px">${r.userName||'User'} → ${r.workerName||'Worker'}</div>
          <div style="font-size:12px;color:var(--muted)">${r.service||'Service'} · ${r.date||''}</div>
        </div>
        <div style="display:flex;align-items:center;gap:8px">
          <span style="color:#FBBF24;font-size:14px">${'★'.repeat(r.rating||0)}${'☆'.repeat(5-(r.rating||0))}</span>
          ${r.flagged?'<span class="badge badge-red">Flagged</span>':''}
        </div>
      </div>
      <p style="font-size:13px;color:var(--muted);line-height:1.5;margin-bottom:10px">"${r.text||''}"</p>
      <div class="action-btns">
        <button class="btn btn-warn btn-sm" onclick="toggleFlag('${r.id}',${!r.flagged})">${r.flagged?'Unflag':'Flag'}</button>
        <button class="btn btn-danger btn-sm" onclick="confirmDelete('review','${r.id}','review by ${(r.userName||'user').replace(/'/g,"\\'")}')">Delete</button>
      </div>
    </div>`).join('');
}

async function toggleFlag(id, newFlaggedVal){
  try {
    await FirebaseHelpers.updateReview(id, { flagged: newFlaggedVal });
    showToast('Review flag updated ✅');
  } catch (e) {
    console.warn('Firebase update error:', e);
    showToast('❌ Error updating flag');
  }
  renderAdminReviews();
}

// =====================================================================
//  ADMIN — CONTENT EDITOR  (saves to Firestore, visible to all users)
// =====================================================================
async function renderAdminContent(){
  // Load live content from Firestore
  const c = await FirebaseHelpers.loadContent();
  DB.updateContent(c);

  document.getElementById('c-tagline').value=c.tagline||'';
  document.getElementById('c-promo-label').value=c.promoLabel||'';
  document.getElementById('c-promo-title').value=c.promoTitle||'';
  document.getElementById('c-promo-code').value=c.promoCode||'';
  document.getElementById('c-promo-sub').value=c.promoSub||'';
  document.getElementById('c-stat1-num').value=c.stat1Num||'';
  document.getElementById('c-stat1-lbl').value=c.stat1Lbl||'';
  document.getElementById('c-stat2-num').value=c.stat2Num||'';
  document.getElementById('c-stat2-lbl').value=c.stat2Lbl||'';
  document.getElementById('c-stat3-num').value=c.stat3Num||'';
  document.getElementById('c-stat3-lbl').value=c.stat3Lbl||'';

  // Load services from Firestore for featured checkboxes
  const allServices = await FirebaseHelpers.loadServices();
  DB.services = allServices;
  const featIds = (c.featuredIds||[]).map(String);
  document.getElementById('featured-service-checkboxes').innerHTML=allServices.map(s=>`
    <label style="display:flex;align-items:center;gap:6px;font-size:13px;cursor:pointer;background:var(--surface2);padding:6px 10px;border-radius:6px;border:1.5px solid ${featIds.includes(String(s.id))?'var(--brand)':'var(--border)'}">
      <input type="checkbox" value="${s.id}" ${featIds.includes(String(s.id))?'checked':''} style="width:auto;accent-color:var(--brand)" onchange="this.closest('label').style.borderColor=this.checked?'var(--brand)':'var(--border)'">
      ${s.icon} ${s.name}
    </label>`).join('');

  const CATS=['Plumbing','Electrical','Cleaning','Aircon','Carpentry','Painting','Pest Control','Appliance Repair'];
  const visCats = c.visibleCategories||CATS;
  document.getElementById('category-toggles').innerHTML=CATS.map(cat=>`
    <label style="display:flex;align-items:center;gap:6px;font-size:13px;cursor:pointer;background:var(--surface2);padding:6px 12px;border-radius:6px;border:1.5px solid ${visCats.includes(cat)?'var(--brand)':'var(--border)'}">
      <input type="checkbox" value="${cat}" ${visCats.includes(cat)?'checked':''} style="width:auto;accent-color:var(--brand)" onchange="this.closest('label').style.borderColor=this.checked?'var(--brand)':'var(--border)'">
      ${cat}
    </label>`).join('');
}

async function saveAllContent(){
  const featuredIds=[...document.querySelectorAll('#featured-service-checkboxes input:checked')].map(cb=>String(cb.value));
  const visCats=[...document.querySelectorAll('#category-toggles input:checked')].map(cb=>cb.value);
  const contentUpdates = {
    tagline:document.getElementById('c-tagline').value,
    promoLabel:document.getElementById('c-promo-label').value,
    promoTitle:document.getElementById('c-promo-title').value,
    promoCode:document.getElementById('c-promo-code').value.toUpperCase(),
    promoSub:document.getElementById('c-promo-sub').value,
    stat1Num:document.getElementById('c-stat1-num').value,
    stat1Lbl:document.getElementById('c-stat1-lbl').value,
    stat2Num:document.getElementById('c-stat2-num').value,
    stat2Lbl:document.getElementById('c-stat2-lbl').value,
    stat3Num:document.getElementById('c-stat3-num').value,
    stat3Lbl:document.getElementById('c-stat3-lbl').value,
    featuredIds,
    visibleCategories:visCats
  };
  
  const success = await FirebaseHelpers.saveContent(contentUpdates);
  
  if(success) {
    DB.updateContent(contentUpdates);
    // Update the visible tagline in the login screen
    const tagEl = document.getElementById('app-tagline');
    if(tagEl) tagEl.textContent = contentUpdates.tagline;
    showToast('✅ Content saved to Firebase — all users will see this!');
  } else {
    // Save locally as fallback
    DB.updateContent(contentUpdates);
    showToast('⚠️ Saved locally (Firebase error — check console)');
  }
}

// =====================================================================
//  ADMIN — REVENUE  (live data from Firestore)
// =====================================================================
async function renderAdminRevenue(){
  const [allBookings, allReviews] = await Promise.all([
    FirebaseHelpers.loadAllBookings(),
    FirebaseHelpers.loadReviews()
  ]);

  const completed=allBookings.filter(b=>b.status==='completed');
  const totalRev=completed.reduce((s,b)=>s+(Number(b.price)||0),0);
  const platformFees=Math.round(totalRev*0.2);
  const workerPayouts=totalRev-platformFees;
  const avgRating=allReviews.length?(allReviews.reduce((s,r)=>s+(Number(r.rating)||0),0)/allReviews.length).toFixed(1):'0.0';

  document.getElementById('revenue-kpis').innerHTML=`
    <div class="kpi-card"><div class="kpi-val">₱${totalRev.toLocaleString()}</div><div class="kpi-label">Total Revenue</div></div>
    <div class="kpi-card green"><div class="kpi-val">₱${platformFees.toLocaleString()}</div><div class="kpi-label">Platform Fees (20%)</div></div>
    <div class="kpi-card orange"><div class="kpi-val">₱${workerPayouts.toLocaleString()}</div><div class="kpi-label">Worker Payouts (80%)</div></div>
    <div class="kpi-card"><div class="kpi-val">${avgRating}★</div><div class="kpi-label">Avg Rating</div></div>`;

  // Monthly breakdown (group completed bookings by month)
  const monthlyMap = {};
  completed.forEach(b => {
    const d = b.date ? b.date.substring(0,7) : 'unknown';
    monthlyMap[d] = (monthlyMap[d]||0) + (Number(b.price)||0);
  });
  const sortedMonths = Object.keys(monthlyMap).sort();
  const recentMonths = sortedMonths.slice(-7);

  if(recentMonths.length > 0) {
    const vals = recentMonths.map(m => monthlyMap[m]);
    const max = Math.max(1,...vals);
    const labels = recentMonths.map(m => {
      const [y,mo] = m.split('-');
      return new Date(y,parseInt(mo)-1).toLocaleString('en',{month:'short'});
    });
    document.getElementById('revenue-chart').innerHTML=`
      <div style="display:flex;align-items:flex-end;gap:8px;height:160px;padding-top:16px">
        ${labels.map((label,i)=>`
        <div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:6px">
          <div style="font-size:11px;font-weight:600;color:var(--brand)">₱${(vals[i]/1000).toFixed(0)}K</div>
          <div style="width:100%;background:${i===labels.length-1?'var(--brand)':'var(--brand-light)'};border-radius:6px 6px 0 0;height:${Math.round(vals[i]/max*120)}px;transition:height .6s ease"></div>
          <div style="font-size:11px;color:var(--muted)">${label}</div>
        </div>`).join('')}
      </div>`;
  } else {
    document.getElementById('revenue-chart').innerHTML='<div style="text-align:center;padding:40px;color:var(--muted)">No completed bookings yet</div>';
  }

  // Category breakdown from live data
  const CATS=['Plumbing','Electrical','Cleaning','Aircon','Carpentry','Painting','Pest Control','Appliance Repair'];
  const catRevs = CATS.map(cat => ({
    cat,
    count: completed.filter(b=>(b.serviceCategory===cat)||(b.serviceName||'').toLowerCase().includes(cat.toLowerCase().split(' ')[0])).length,
    revenue: completed.filter(b=>(b.serviceCategory===cat)||(b.serviceName||'').toLowerCase().includes(cat.toLowerCase().split(' ')[0])).reduce((s,b)=>s+(Number(b.price)||0),0)
  })).filter(r=>r.count>0);
  const totalCatRev = catRevs.reduce((s,r)=>s+r.revenue,0)||1;

  document.getElementById('revenue-breakdown-table').innerHTML=catRevs.length===0?
    '<caption style="padding:20px;color:var(--muted)">No completed bookings yet</caption>':
    `<thead><tr><th>Category</th><th>Bookings</th><th>Revenue</th><th>Platform Fee</th><th>% of Total</th></tr></thead>
    <tbody>${catRevs.map(r=>`<tr>
      <td style="font-weight:600">${r.cat}</td>
      <td>${r.count}</td>
      <td style="color:var(--brand);font-weight:600">₱${r.revenue.toLocaleString()}</td>
      <td style="color:var(--success)">₱${Math.round(r.revenue*0.2).toLocaleString()}</td>
      <td>${Math.round(r.revenue/totalCatRev*100)}%</td>
    </tr>`).join('')}</tbody>`;
}

// =====================================================================
//  DELETE CONFIRM
// =====================================================================
function confirmDelete(type,id,label){
  document.getElementById('delete-title').textContent='Delete '+type.charAt(0).toUpperCase()+type.slice(1)+'?';
  document.getElementById('delete-desc').textContent=`Are you sure you want to delete "${label}"? This cannot be undone.`;
  const iconEl = document.getElementById('delete-icon');
  iconEl.innerHTML = type==='review'?
    '<span style="font-size:26px">⭐</span>' :
    `<svg width="26" height="26" stroke="var(--danger)" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><use href="#ic-trash"/></svg>`;
  document.getElementById('delete-confirm-btn').onclick=()=>{ performDelete(type,id); closeDeleteModal(); };
  document.getElementById('delete-confirm-modal').classList.add('open');
}

function closeDeleteModal(){ document.getElementById('delete-confirm-modal').classList.remove('open'); }

async function performDelete(type,id){
  try {
    if(type==='service'){ 
      await FirebaseHelpers.deleteService(id);
      DB.deleteService(id); 
      showToast('Service deleted ✅ — removed from users\' view'); 
      renderAdminServices(); 
    }
    else if(type==='worker'){ 
      const { doc, deleteDoc } = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js');
      await deleteDoc(doc(window.firebaseDB, 'workers', String(id)));
      DB.workers = DB.workers.filter(w=>String(w.id)!==String(id));
      showToast('Worker deleted ✅'); 
      renderAdminWorkers(); 
    }
    else if(type==='review'){ 
      await FirebaseHelpers.deleteReview(id);
      DB.deleteReview(id); 
      showToast('Review deleted ✅'); 
      renderAdminReviews(); 
    }
  } catch (e) {
    console.error('Firebase delete error:', e);
    showToast('❌ Error deleting ' + type);
  }
}

// =====================================================================
//  KEYBOARD & GLOBAL EVENTS
// =====================================================================
document.addEventListener('keydown',e=>{
  if(e.key==='Escape'){
    document.querySelectorAll('.modal-center.open').forEach(m=>m.classList.remove('open'));
    document.querySelectorAll('.modal-overlay.open').forEach(m=>m.classList.remove('open'));
    closeMobileSidebar();
  }
});

document.querySelectorAll('.modal-center').forEach(modal=>{
  modal.addEventListener('click',e=>{ if(e.target===modal) modal.classList.remove('open'); });
});
document.querySelectorAll('.modal-overlay').forEach(modal=>{
  modal.addEventListener('click',e=>{ if(e.target===modal) modal.classList.remove('open'); });
});

window.addEventListener('resize',()=>{
  const btn=document.getElementById('admin-menu-btn');
  if(window.innerWidth>=768){
    btn.style.display='none';
    closeMobileSidebar();
  } else if(document.getElementById('admin-view').classList.contains('open')){
    btn.style.display='flex';
  }
});

// =====================================================================
//  LEGAL MODALS — Terms of Service & Privacy Policy
// =====================================================================
const LEGAL_CONTENT = {
  terms: {
    title: 'Terms of Service',
    date: 'Last Updated: 04/14/26',
    body: `
      <p style="margin-bottom:16px">Welcome to HomeXperts. These Terms of Service ("Terms") govern your access to and use of the HomeXperts mobile application and website ("Platform"). By creating an account or using the Platform, you agree to be bound by these Terms.</p>

      <h4 style="font-size:14px;font-weight:700;margin-bottom:6px;color:var(--brand)">1. Eligibility and Account Registration</h4>
      <p style="margin-bottom:14px">You must be at least eighteen (18) years old to create an account and use the Platform. You agree to provide accurate, complete, and updated information at all times. You are responsible for maintaining the confidentiality of your account credentials and for all activities conducted under your account.</p>

      <h4 style="font-size:14px;font-weight:700;margin-bottom:6px;color:var(--brand)">2. Use of the Platform</h4>
      <p style="margin-bottom:14px">The Platform allows users to connect with service providers for home-related services. You agree to use the Platform only for lawful purposes and in accordance with these Terms. Any misuse, fraudulent activity, or attempt to disrupt the Platform's operations is strictly prohibited.</p>

      <h4 style="font-size:14px;font-weight:700;margin-bottom:6px;color:var(--brand)">3. Bookings and Services</h4>
      <p style="margin-bottom:14px">Customers may request and book services through the Platform. Service providers are responsible for delivering services in a professional and timely manner. HomeXperts acts as a facilitator and does not directly perform the services unless otherwise stated.</p>

      <h4 style="font-size:14px;font-weight:700;margin-bottom:6px;color:var(--brand)">4. Payments and Fees</h4>
      <p style="margin-bottom:14px">All payments must be completed using the payment methods available on the Platform. A 20% platform service fee applies to all bookings. HomeXperts may update its fees from time to time with proper notice.</p>

      <h4 style="font-size:14px;font-weight:700;margin-bottom:6px;color:var(--brand)">5. Cancellation and Refund Policy</h4>
      <p style="margin-bottom:14px">Customers may cancel bookings prior to the scheduled service time. Cancellation fees may apply. Refund requests must be submitted through the Platform within a reasonable period after the service date.</p>

      <h4 style="font-size:14px;font-weight:700;margin-bottom:6px;color:var(--brand)">6. Governing Law</h4>
      <p style="margin-bottom:14px">These Terms shall be governed by and interpreted in accordance with the laws of the Republic of the Philippines.</p>
    `
  },
  privacy: {
    title: 'Privacy Policy',
    date: 'Effective Date: 04/14/26 | Last Updated: 03/11/26',
    body: `
      <p style="margin-bottom:14px">This Privacy Policy explains how we collect, use, store, protect, and share your information when you use the HomeXperts platform.</p>

      <h4 style="font-size:14px;font-weight:700;margin-bottom:6px;color:var(--brand)">1. Information We Collect</h4>
      <ul style="margin-bottom:14px;padding-left:18px">
        <li>Full name, email address, phone number</li>
        <li>Account and transaction history</li>
        <li>Device and technical information</li>
        <li>Location data (with your permission)</li>
      </ul>

      <h4 style="font-size:14px;font-weight:700;margin-bottom:6px;color:var(--brand)">2. How We Use Your Information</h4>
      <ul style="margin-bottom:14px;padding-left:18px">
        <li>To create and manage your account</li>
        <li>To process transactions and bookings</li>
        <li>To improve App performance and user experience</li>
        <li>To detect, prevent, and address fraud or abuse</li>
      </ul>

      <h4 style="font-size:14px;font-weight:700;margin-bottom:6px;color:var(--brand)">3. Contact Us</h4>
      <p>Email: <b>homeXperts@gmail.com</b><br>Support: <b>09171928027</b></p>
    `
  }
};

function openLegalModal(type) {
  const content = LEGAL_CONTENT[type];
  if (!content) return;
  document.getElementById('legal-modal-title').textContent = content.title;
  document.getElementById('legal-modal-date').textContent = content.date;
  document.getElementById('legal-modal-body').innerHTML = content.body;
  document.getElementById('legal-modal').classList.add('open');
}

function closeLegalModal() {
  document.getElementById('legal-modal').classList.remove('open');
}

// =====================================================================
//  INIT
// =====================================================================
window.addEventListener('DOMContentLoaded',()=>{
  // Load content from Firestore on startup (updates tagline etc.)
  FirebaseHelpers.loadContent().then(c => {
    DB.updateContent(c);
    const tagEl = document.getElementById('app-tagline');
    if(tagEl) tagEl.textContent = c.tagline || 'Your trusted home service platform';
  });

  // Prevent zoom on double tap (iOS)
  let lastTouchEnd=0;
  document.addEventListener('touchend',e=>{
    const now=Date.now();
    if(now-lastTouchEnd<=300){ e.preventDefault(); }
    lastTouchEnd=now;
  },false);
});

// =====================================================================
//  WEB APP LAYOUT CONTROLLER
// =====================================================================
(function(){
  const TAB_LABELS = { home:'Home', bookings:'My Bookings', profile:'Profile' };
  const SCREEN_LABELS = {
    'services':'Browse Services','service-detail':'Service Details',
    'booking':'Book a Service','worker-matching':'Available Workers',
    'confirmation':'Booking Confirmed','booking-detail':'Booking Details',
    'rating':'Rate Experience',
  };

  function showLayout(screen){
    const appView = document.getElementById('user-app-view');
    const loginEl = document.getElementById('screen-login');
    const regEl   = document.getElementById('screen-register');
    if(!appView||!loginEl||!regEl) return;

    if(screen==='login'){
      appView.classList.remove('open');
      loginEl.classList.add('active');
      regEl.classList.remove('active');
    } else if(screen==='register'){
      appView.classList.remove('open');
      regEl.classList.add('active');
      loginEl.classList.remove('active');
    } else {
      loginEl.classList.remove('active');
      regEl.classList.remove('active');
      appView.classList.add('open');
    }
  }

  function updateTopbar(screen){
    const el = document.getElementById('user-page-title');
    if(el) el.textContent = TAB_LABELS[screen] || SCREEN_LABELS[screen] || 'HomeXperts';
  }

  function syncNav(screen){
    let tab = screen;
    const secondaryToHome = ['services','service-detail','booking','worker-matching','confirmation','booking-detail'];
    if(secondaryToHome.includes(screen)) tab='home';
    else if(screen==='rating') tab='bookings';

    document.querySelectorAll('.user-nav-item,.user-bnav-item').forEach(el=>{
      el.classList.toggle('active', el.dataset.screen===tab);
    });
  }

  window.syncUser = function(){
    const user = window.state && window.state.user;
    const isGuest = user && user.id==='GUEST';

    const avatarEl = document.getElementById('topbar-avatar');
    if(avatarEl){
      avatarEl.textContent = (user && user.name)
        ? user.name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase()
        : '?';
    }

    const block = document.getElementById('sidebar-user-block');
    const sideAvatar = document.getElementById('sidebar-avatar');
    const sideName = document.getElementById('sidebar-user-name');
    const sideRole = document.getElementById('sidebar-user-role');

    if(block){
      if(user){
        block.style.display='flex';
        if(sideAvatar) sideAvatar.textContent = user.name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase();
        if(sideName) sideName.textContent = user.name;
        if(sideRole) sideRole.textContent = isGuest ? 'Guest' : 'Member';
      } else {
        block.style.display='none';
      }
    }
  };

  window.toggleUserSidebar = function(){
    document.getElementById('user-sidebar').classList.toggle('open');
    document.getElementById('user-overlay-close').classList.toggle('visible');
  };
  window.closeUserSidebar = function(){
    document.getElementById('user-sidebar').classList.remove('open');
    document.getElementById('user-overlay-close').classList.remove('visible');
  };

  const _origGoScreen = window.goScreen;
  window.goScreen = function(name){
    _origGoScreen(name);
    showLayout(name);
    updateTopbar(name);
    syncNav(name);
    syncUser();
    closeUserSidebar();
  };

  document.addEventListener('DOMContentLoaded', function(){
    showLayout('login');
    document.getElementById('screen-login').classList.add('active');
    syncUser();
  });

})();
