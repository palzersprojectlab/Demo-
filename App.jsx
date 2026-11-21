import React, { useEffect, useMemo, useState } from 'react';
import {
  LayoutDashboard, Wallet, ReceiptText, History, ChartNoAxesCombined, Settings,
  LogOut, Plus, Search, Download, Bell, ChevronDown, ArrowUpRight, ArrowDownRight,
  Building2, CheckCircle2, Clock3, AlertTriangle, Camera, FileText, Menu, X,
  Landmark, IndianRupee, CalendarDays, ShieldCheck
} from 'lucide-react';

const STORES = ['Jio World Drive', 'Store B', 'Store C'];
const DEMO_USERS = [
  { label: 'Head Office Admin', role: 'admin', store: 'ALL STORES' },
  { label: 'Jio World Drive Manager', role: 'manager', store: 'Jio World Drive' },
  { label: 'Jio World Drive Employee', role: 'employee', store: 'Jio World Drive' },
  { label: 'Store B Manager', role: 'manager', store: 'Store B' },
  { label: 'Store C Manager', role: 'manager', store: 'Store C' }
];
const money = n => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(n || 0));
const today = () => new Date().toISOString().slice(0,10);
const seed = {
  collections: [
    {id:1,store:'Jio World Drive',date:'2026-11-20',collected:25000,float:5000,handover:20000,handoverDate:'2026-11-21',receiver:'Cash in-charge',status:'Balanced'},
    {id:2,store:'Jio World Drive',date:'2026-11-21',collected:32000,float:5000,handover:27000,handoverDate:'',receiver:'',status:'Pending'},
    {id:3,store:'Store B',date:'2026-11-20',collected:30000,float:5000,handover:25000,handoverDate:'2026-11-21',receiver:'Cash in-charge',status:'Balanced'},
    {id:4,store:'Store C',date:'2026-11-20',collected:18000,float:5000,handover:13000,handoverDate:'',receiver:'',status:'Pending'}
  ],
  allocations: [
    {id:1,store:'Jio World Drive',month:'2026-11',amount:10000,carry:0},
    {id:2,store:'Store B',month:'2026-11',amount:8000,carry:0},
    {id:3,store:'Store C',month:'2026-11',amount:7000,carry:0}
  ],
  expenses: [
    {id:1,store:'Jio World Drive',date:'2026-11-04',category:'Omni',amount:1200,description:'Customer delivery',receipt:'',status:'Approved'},
    {id:2,store:'Jio World Drive',date:'2026-11-08',category:'Rapido',amount:800,description:'Inter-store movement',receipt:'',status:'Approved'},
    {id:3,store:'Jio World Drive',date:'2026-11-12',category:'Food & Beverage',amount:900,description:'Store refreshments',receipt:'',status:'Pending'},
    {id:4,store:'Store B',date:'2026-11-14',category:'Others',amount:900,description:'Packing supplies',receipt:'',status:'Approved'},
    {id:5,store:'Store C',date:'2026-11-15',category:'Transportation',amount:600,description:'Local transport',receipt:'',status:'Pending'}
  ],
  categories: ['Omni','Rapido','Food & Beverage','Transportation','Packaging','Stationery','Maintenance','Others']
};
function loadData(){ try { return JSON.parse(localStorage.getItem('nicobar-finance-data')) || seed; } catch { return seed; } }
function saveData(d){ localStorage.setItem('nicobar-finance-data', JSON.stringify(d)); }
function Stat({label,value,sub,icon:Icon,tone=''}) { return <div className="stat"><div className="stat-top"><span>{label}</span><span className="stat-icon"><Icon size={17}/></span></div><strong className={tone}>{value}</strong><small>{sub}</small></div>; }
function Status({value}) { const cls = value==='Balanced'||value==='Approved'?'good':value==='Pending'?'pending':value==='Discrepancy'||value==='Rejected'?'bad':'neutral'; return <span className={'status '+cls}>{value}</span>; }
function Field({label,children}) { return <label className="field"><span>{label}</span>{children}</label>; }
function Modal({title,onClose,children}) { return <div className="overlay" onMouseDown={e=>e.target===e.currentTarget&&onClose()}><div className="modal"><div className="modal-head"><h3>{title}</h3><button className="icon-btn" onClick={onClose}><X size={18}/></button></div>{children}</div></div>; }

export default function App(){
  const [data,setData] = useState(loadData);
  const [user,setUser] = useState(null);
  const [page,setPage] = useState('Dashboard');
  const [showLogin,setShowLogin] = useState(true);
  const [modal,setModal] = useState('');
  const [query,setQuery] = useState('');
  const [notice,setNotice] = useState('');
  const [mobileNav,setMobileNav] = useState(false);
  const [collectionForm,setCollectionForm] = useState({date:today(),collected:'',float:'5000'});
  const [handoverForm,setHandoverForm] = useState({id:'',date:today(),amount:'',receiver:''});
  const [expenseForm,setExpenseForm] = useState({date:today(),category:'Omni',amount:'',description:'',receipt:''});
  const [allocationForm,setAllocationForm] = useState({store:'Jio World Drive',month:today().slice(0,7),amount:''});
  const [categoryForm,setCategoryForm] = useState('');
  const [selectedStore,setSelectedStore] = useState('Jio World Drive');
  useEffect(()=>saveData(data),[data]);
  useEffect(()=>{ if(notice){const t=setTimeout(()=>setNotice(''),3200);return ()=>clearTimeout(t)}},[notice]);
  const isAdmin=user?.role==='admin';
  const store=user?.store;
  const visibleStores=isAdmin?STORES:[store];
  const activeStore=isAdmin?selectedStore:store;
  const collections=useMemo(()=>data.collections.filter(x=>visibleStores.includes(x.store)),[data,store]);
  const expenses=useMemo(()=>data.expenses.filter(x=>visibleStores.includes(x.store)),[data,store]);
  const allocations=useMemo(()=>data.allocations.filter(x=>visibleStores.includes(x.store)),[data,store]);
  const scopedCollections=collections.filter(x=>isAdmin?x.store===activeStore:true);
  const scopedExpenses=expenses.filter(x=>isAdmin?x.store===activeStore:true);
  const scopedAllocations=allocations.filter(x=>isAdmin?x.store===activeStore:true);
  const month=today().slice(0,7);
  const allocation=scopedAllocations.filter(x=>x.month===month).reduce((a,x)=>a+x.amount+x.carry,0);
  const approved=scopedExpenses.filter(x=>x.status==='Approved'&&x.date.startsWith(month)).reduce((a,x)=>a+x.amount,0);
  const pending=scopedExpenses.filter(x=>x.status==='Pending'&&x.date.startsWith(month)).reduce((a,x)=>a+x.amount,0);
  const balance=allocation-approved-pending;
  const totalCollected=scopedCollections.reduce((a,x)=>a+x.collected,0);
  const totalHanded=scopedCollections.reduce((a,x)=>a+(x.status==='Balanced'?x.handover:0),0);
  const pendingHandover=scopedCollections.filter(x=>x.status==='Pending').length;
  const setAndSave=fn=>setData(old=>fn(old));
  const notify=t=>setNotice(t);
  const doLogin=u=>{setUser(u);setSelectedStore(u.role==='admin'?'Jio World Drive':u.store);setShowLogin(false);setPage('Dashboard');};
  const addCollection=e=>{e.preventDefault();const collected=Number(collectionForm.collected),fl=Number(collectionForm.float);if(!collected||collected<fl){notify('Collection must be at least the float amount.');return;}setAndSave(d=>({...d,collections:[{id:Date.now(),store:activeStore,date:collectionForm.date,collected,float:fl,handover:collected-fl,handoverDate:'',receiver:'',status:'Pending'},...d.collections]}));setModal('');setCollectionForm({date:today(),collected:'',float:'5000'});notify('Cash collection saved. Next-day handover is pending.');};
  const openHandover=c=>{setHandoverForm({id:String(c.id),date:today(),amount:String(c.handover),receiver:''});setModal('handover');};
  const submitHandover=e=>{e.preventDefault();const amount=Number(handoverForm.amount);setAndSave(d=>({...d,collections:d.collections.map(c=>c.id===Number(handoverForm.id)?{...c,handoverDate:handoverForm.date,actualHandover:amount,receiver:handoverForm.receiver,status:amount===c.handover?'Balanced':'Discrepancy'}:c)}));setModal('');notify('Handover recorded.');};
  const addExpense=e=>{e.preventDefault();if(!Number(expenseForm.amount)||Number(expenseForm.amount)<=0){notify('Enter a valid expense amount.');return;}if(Number(expenseForm.amount)>balance){notify('This expense exceeds the available petty cash balance.');return;}setAndSave(d=>({...d,expenses:[{id:Date.now(),store:activeStore,...expenseForm,amount:Number(expenseForm.amount),status:'Pending'},...d.expenses]}));setModal('');setExpenseForm({date:today(),category:data.categories[0]||'Others',amount:'',description:'',receipt:''});notify('Expense submitted for approval.');};
  const uploadReceipt=e=>{const f=e.target.files?.[0];if(!f)return;if(f.size>2*1024*1024){notify('Demo upload limit is 2 MB.');return;}const r=new FileReader();r.onload=()=>setExpenseForm(x=>({...x,receipt:r.result}));r.readAsDataURL(f);};
  const saveAllocation=e=>{e.preventDefault();const amount=Number(allocationForm.amount);if(!amount||amount<0)return;setAndSave(d=>({...d,allocations:[...d.allocations.filter(a=>!(a.store===allocationForm.store&&a.month===allocationForm.month)),{id:Date.now(),...allocationForm,amount,carry:0}]}));setModal('');notify('Monthly allocation saved.');};
  const reviewExpense=(id,status)=>{setAndSave(d=>({...d,expenses:d.expenses.map(x=>x.id===id?{...x,status}:x)}));notify('Expense marked '+status.toLowerCase()+'.');};
  const addCategory=e=>{e.preventDefault();if(categoryForm.trim()&&!data.categories.includes(categoryForm.trim()))setAndSave(d=>({...d,categories:[...d.categories,categoryForm.trim()]}));setCategoryForm('');notify('Category added.');};
  const nav=[['Dashboard',LayoutDashboard],['Cash Consol',Wallet],['Petty Cash',ReceiptText],['Transaction History',History],['Reports',ChartNoAxesCombined],...(isAdmin?[['All Stores',Building2],['Approvals',ShieldCheck],['Settings',Settings]]:[])];
  const filteredExpenses=scopedExpenses.filter(x=>(x.description+' '+x.category+' '+x.status).toLowerCase().includes(query.toLowerCase()));
  const filteredCollections=scopedCollections.filter(x=>(x.date+' '+x.status).toLowerCase().includes(query.toLowerCase()));
  const exportCSV=rows=>{if(!rows.length){notify('No records to export.');return;}const keys=Object.keys(rows[0]);const csv=[keys.join(','),...rows.map(r=>keys.map(k=>'"'+String(r[k]??'').replaceAll('"','""')+'"').join(','))].join('\n');const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));a.download='nicobar-'+page.toLowerCase().replaceAll(' ','-')+'.csv';a.click();URL.revokeObjectURL(a.href);};
  if(showLogin||!user)return <div className="login-screen"><div className="login-card"><div className="brand">nicobar<span>.</span></div><div className="eyebrow">STORE FINANCE PORTAL</div><h1>Welcome back.</h1><p className="muted">A considered way to manage store finances.</p><div className="demo-label">DEMO ACCESS · SELECT A ROLE</div>{DEMO_USERS.map(u=><button key={u.label} className="login-option" onClick={()=>doLogin(u)}><span><b>{u.label}</b><small>{u.role==='admin'?'Company-wide access':u.store+' · '+u.role}</small></span><ArrowUpRight size={17}/></button>)}<p className="fineprint">Demonstration only. No real authentication or cloud storage is configured.</p></div></div>;

  return <div className="app-shell">
    <aside className={'sidebar '+(mobileNav?'open':'')}><div className="side-brand"><div className="brand">nicobar<span>.</span></div><div className="side-caption">STORE FINANCE</div><button className="mobile-close icon-btn" onClick={()=>setMobileNav(false)}><X/></button></div>
      <div className="store-chip"><Building2 size={15}/><span>{isAdmin?'Head Office':store}</span><ChevronDown size={14}/></div>
      <nav>{nav.map(([n,I])=><button key={n} className={'nav-item '+(page===n?'active':'')} onClick={()=>{setPage(n);setMobileNav(false)}}><I size={18}/>{n}</button>)}</nav>
      <div className="sidebar-bottom"><div className="user-mini"><div className="avatar">{isAdmin?'HO':store.slice(0,2).toUpperCase()}</div><div><b>{user.label}</b><small>{user.role}</small></div></div><button className="nav-item logout" onClick={()=>{setUser(null);setShowLogin(true)}}><LogOut size={17}/>Sign out</button></div>
    </aside>
    <main className="main">
      <header className="topbar"><button className="icon-btn mobile-menu" onClick={()=>setMobileNav(true)}><Menu/></button><div className="crumb">Finance <span>/</span> {page}</div><div className="top-actions">{isAdmin&&<select className="store-select" value={selectedStore} onChange={e=>setSelectedStore(e.target.value)}>{STORES.map(s=><option key={s}>{s}</option>)}</select>}<span className="demo-pill">DEMO DATA</span><button className="icon-btn" title="Notifications"><Bell size={18}/></button></div></header>
      <div className="content">
        <div className="page-heading"><div><div className="eyebrow">{isAdmin?'HEAD OFFICE VIEW':'STORE OVERVIEW'}</div><h1>{page==='Dashboard'?'Good day.':page}</h1><p>{isAdmin?'A consolidated view of store finances.':activeStore+' · Your store finance overview'}</p></div><div className="heading-date"><CalendarDays size={15}/>{new Date().toLocaleDateString('en-IN',{day:'2-digit',month:'long',year:'numeric'})}</div></div>

        {page==='Dashboard'&&<><div className="section-title"><h2>Cash Consol</h2><span>Daily collections & next-day handovers</span></div><div className="stats-grid"><Stat label="Cash collected" value={money(totalCollected)} sub="Recorded collections" icon={IndianRupee}/><Stat label="Cash handed over" value={money(totalHanded)} sub="Balanced handovers only" icon={Landmark}/><Stat label="Pending handovers" value={pendingHandover} sub="Awaiting confirmation" icon={Clock3} tone="amber"/><Stat label="Float standard" value={money(5000)} sub="Kept at the store" icon={Wallet}/></div>
          <div className="section-title space-top"><h2>Petty Cash</h2><span>Independent monthly expense account</span></div><div className="stats-grid"><Stat label="Monthly allocation" value={money(allocation)} sub="Current month" icon={Wallet}/><Stat label="Approved expenses" value={money(approved)} sub="Current month" icon={ArrowUpRight}/><Stat label="Pending expenses" value={money(pending)} sub="Awaiting review" icon={Clock3} tone="amber"/><Stat label="Available balance" value={money(balance)} sub="After pending reservations" icon={IndianRupee} tone="green"/></div>
          <div className="two-col space-top"><section className="panel"><div className="panel-head"><div><h3>Recent Cash Consol</h3><p>Latest collection records</p></div><button className="text-btn" onClick={()=>setPage('Cash Consol')}>View all <ArrowUpRight size={14}/></button></div><Table headers={['Business date','Collected','Expected handover','Status']} rows={scopedCollections.slice(0,4).map(c=>[c.date,money(c.collected),money(c.handover),<Status value={c.status}/>])}/></section><section className="panel"><div className="panel-head"><div><h3>Petty cash activity</h3><p>Latest submitted expenses</p></div><button className="text-btn" onClick={()=>setPage('Petty Cash')}>View all <ArrowUpRight size={14}/></button></div><Table headers={['Expense','Amount','Status']} rows={scopedExpenses.slice(0,4).map(x=>[x.category,money(x.amount),<Status value={x.status}/>])}/></section></div>
        </>}

        {page==='Cash Consol'&&<><div className="action-row"><div><h2>Daily cash records</h2><p>Record sales collections and next-day handovers. Float is separate and fixed at ₹5,000 by default.</p></div><button className="primary-btn" onClick={()=>setModal('collection')}><Plus size={17}/>Add collection</button></div><div className="callout"><AlertTriangle size={17}/><span><b>Accounting rule:</b> Cash Consol is independent of Petty Cash. Expected handover = cash collected minus the store float.</span></div><div className="toolbar"><div className="search"><Search size={16}/><input placeholder="Search records..." value={query} onChange={e=>setQuery(e.target.value)}/></div><button className="secondary-btn" onClick={()=>exportCSV(filteredCollections)}><Download size={16}/>Export CSV</button></div><section className="panel"><Table headers={['Business date','Cash collected','Float','Expected handover','Actual handover','Status','Action']} rows={filteredCollections.map(c=>[c.date,money(c.collected),money(c.float),money(c.handover),c.actualHandover==null?'—':money(c.actualHandover),<Status value={c.status}/>,c.status==='Pending'?<button className="small-btn" onClick={()=>openHandover(c)}>Record handover</button>:<span className="muted">Recorded</span>])}/></section></>}

        {page==='Petty Cash'&&<><div className="action-row"><div><h2>Monthly petty cash</h2><p>Separate monthly allocation for store operations and expenses.</p></div><button className="primary-btn" onClick={()=>setModal('expense')}><Plus size={17}/>Add expense</button></div><div className="stats-grid"><Stat label="Monthly allocation" value={money(allocation)} sub={month} icon={Wallet}/><Stat label="Approved spend" value={money(approved)} sub="Approved expenses" icon={ArrowUpRight}/><Stat label="Pending review" value={money(pending)} sub="Provisionally reserved" icon={Clock3} tone="amber"/><Stat label="Available balance" value={money(balance)} sub="After pending expenses" icon={IndianRupee} tone="green"/></div><div className="budget-panel"><div className="budget-head"><div><span>MONTHLY BUDGET UTILISATION</span><strong>{allocation?Math.round((approved+pending)/allocation*100):0}%</strong></div><span>{money(approved+pending)} of {money(allocation)}</span></div><div className="progress"><div style={{width:Math.min(100,allocation?(approved+pending)/allocation*100:0)+'%'}}/></div></div><div className="toolbar"><div className="search"><Search size={16}/><input placeholder="Search expenses..." value={query} onChange={e=>setQuery(e.target.value)}/></div><button className="secondary-btn" onClick={()=>exportCSV(filteredExpenses)}><Download size={16}/>Export CSV</button></div><section className="panel"><Table headers={['Date','Category','Description','Amount','Receipt','Status',...(isAdmin?['Review']:[])]} rows={filteredExpenses.map(x=>[x.date,x.category,x.description,money(x.amount),x.receipt?<a className="text-btn" href={x.receipt} target="_blank">View receipt</a>:'—',<Status value={x.status}/>,...(isAdmin&&x.status==='Pending'?[<div className="inline-actions"><button className="small-btn" onClick={()=>reviewExpense(x.id,'Approved')}>Approve</button><button className="small-btn danger" onClick={()=>reviewExpense(x.id,'Rejected')}>Reject</button></div>]:isAdmin?['—']:[])])}/></section></>}

        {page==='Transaction History'&&<><div className="action-row"><div><h2>All transactions</h2><p>Search and review records for this store.</p></div><button className="secondary-btn" onClick={()=>exportCSV([...filteredCollections.map(x=>({...x,type:'Cash Consol'})),...filteredExpenses.map(x=>({...x,type:'Petty Cash'}))])}><Download size={16}/>Export all</button></div><div className="toolbar"><div className="search"><Search size={16}/><input placeholder="Search by date, category or status..." value={query} onChange={e=>setQuery(e.target.value)}/></div></div><section className="panel"><h3 className="panel-title">Petty cash transactions</h3><Table headers={['Date','Category','Description','Amount','Status']} rows={filteredExpenses.map(x=>[x.date,x.category,x.description,money(x.amount),<Status value={x.status}/>])}/><h3 className="panel-title second">Cash Consol transactions</h3><Table headers={['Date','Collected','Expected handover','Actual','Status']} rows={filteredCollections.map(x=>[x.date,money(x.collected),money(x.handover),x.actualHandover==null?'—':money(x.actualHandover),<Status value={x.status}/>])}/></section></>}

        {page==='Reports'&&<><div className="action-row"><div><h2>Store reports</h2><p>Download the currently visible store's records for further analysis.</p></div></div><div className="report-grid"><div className="report-card"><FileText/><h3>Cash Consol report</h3><p>Collections, expected handovers, actual handovers and discrepancies.</p><button className="secondary-btn" onClick={()=>exportCSV(scopedCollections)}>Download CSV <Download size={15}/></button></div><div className="report-card"><ReceiptText/><h3>Petty cash register</h3><p>Allocations, expense categories, approvals and balances.</p><button className="secondary-btn" onClick={()=>exportCSV(scopedExpenses)}>Download CSV <Download size={15}/></button></div></div></>}

        {page==='All Stores'&&isAdmin&&<><div className="section-title"><h2>Store comparison</h2><span>Illustrative multi-store overview</span></div><section className="panel"><Table headers={['Store','Cash collected','Balanced handovers','Pending','Petty cash allocation','Approved spend','Available']} rows={STORES.map(s=>{const cs=data.collections.filter(x=>x.store===s),es=data.expenses.filter(x=>x.store===s),al=data.allocations.filter(x=>x.store===s&&x.month===month).reduce((a,x)=>a+x.amount,0),sp=es.filter(x=>x.status==='Approved'&&x.date.startsWith(month)).reduce((a,x)=>a+x.amount,0);return [s,money(cs.reduce((a,x)=>a+x.collected,0)),money(cs.filter(x=>x.status==='Balanced').reduce((a,x)=>a+(x.actualHandover??x.handover),0)),cs.filter(x=>x.status==='Pending').length,money(al),money(sp),money(al-sp)];})}/></section></>}

        {page==='Approvals'&&isAdmin&&<section className="panel"><div className="panel-head"><div><h3>Expense approvals</h3><p>Review submitted petty cash claims across stores.</p></div></div><Table headers={['Store','Date','Category','Description','Amount','Action']} rows={data.expenses.filter(x=>x.status==='Pending').map(x=>[x.store,x.date,x.category,x.description,money(x.amount),<div className="inline-actions"><button className="small-btn" onClick={()=>reviewExpense(x.id,'Approved')}>Approve</button><button className="small-btn danger" onClick={()=>reviewExpense(x.id,'Rejected')}>Reject</button></div>])}/></section>}

        {page==='Settings'&&isAdmin&&<><section className="panel"><h3>Store petty cash allocations</h3><p className="muted">Set each store's monthly budget. This demo replaces that store's allocation for the selected month.</p><button className="primary-btn" onClick={()=>setModal('allocation')}><Plus size={17}/>Set allocation</button><Table headers={['Store','Month','Allocation']} rows={data.allocations.map(a=>[a.store,a.month,money(a.amount)])}/></section><section className="panel space-top"><h3>Expense categories</h3><form className="inline-form" onSubmit={addCategory}><input value={categoryForm} onChange={e=>setCategoryForm(e.target.value)} placeholder="New category name"/><button className="primary-btn"><Plus size={16}/>Add</button></form><div className="category-list">{data.categories.map(c=><span className="category-chip" key={c}>{c}</span>)}</div></section></>}
      </div>
    </main>

    {modal==='collection'&&<Modal title="Record cash collection" onClose={()=>setModal('')}><form onSubmit={addCollection} className="form-stack"><Field label="Business date"><input type="date" value={collectionForm.date} onChange={e=>setCollectionForm({...collectionForm,date:e.target.value})} required/></Field><Field label="Cash collected (₹)"><input type="number" min="5000" step="1" value={collectionForm.collected} onChange={e=>setCollectionForm({...collectionForm,collected:e.target.value})} placeholder="Enter cash collected" required/></Field><Field label="Store float (₹)"><input type="number" value={collectionForm.float} onChange={e=>setCollectionForm({...collectionForm,float:e.target.value})} required/></Field><div className="calc-box"><span>Expected next-day handover</span><strong>{money(Math.max(0,Number(collectionForm.collected||0)-Number(collectionForm.float||0)))}</strong></div><p className="fineprint">This records the collection only. The handover must be confirmed separately on the following day.</p><button className="primary-btn full">Save collection</button></form></Modal>}
    {modal==='handover'&&<Modal title="Record next-day handover" onClose={()=>setModal('')}><form onSubmit={submitHandover} className="form-stack"><Field label="Handover date"><input type="date" value={handoverForm.date} onChange={e=>setHandoverForm({...handoverForm,date:e.target.value})}/></Field><Field label="Actual amount handed over (₹)"><input type="number" min="0" value={handoverForm.amount} onChange={e=>setHandoverForm({...handoverForm,amount:e.target.value})} required/></Field><Field label="Received by"><input value={handoverForm.receiver} onChange={e=>setHandoverForm({...handoverForm,receiver:e.target.value})} placeholder="Name of person in charge" required/></Field><button className="primary-btn full">Confirm handover</button></form></Modal>}
    {modal==='expense'&&<Modal title="Submit petty cash expense" onClose={()=>setModal('')}><form onSubmit={addExpense} className="form-stack"><Field label="Expense date"><input type="date" value={expenseForm.date} onChange={e=>setExpenseForm({...expenseForm,date:e.target.value})}/></Field><Field label="Expense category"><select value={expenseForm.category} onChange={e=>setExpenseForm({...expenseForm,category:e.target.value})}>{data.categories.map(c=><option key={c}>{c}</option>)}</select></Field><Field label="Amount (₹)"><input type="number" min="1" value={expenseForm.amount} onChange={e=>setExpenseForm({...expenseForm,amount:e.target.value})} placeholder="Enter amount" required/></Field><Field label="Description"><textarea value={expenseForm.description} onChange={e=>setExpenseForm({...expenseForm,description:e.target.value})} placeholder="What was this expense for?" rows="2" required/></Field><Field label="Receipt attachment"><input type="file" accept="image/*,.pdf" onChange={uploadReceipt}/></Field>{expenseForm.receipt&&<div className="receipt-preview"><CheckCircle2 size={16}/> Receipt attached successfully.</div>}<div className="calc-box"><span>Available petty cash balance</span><strong>{money(balance)}</strong></div><button className="primary-btn full">Submit for approval</button></form></Modal>}
    {modal==='allocation'&&<Modal title="Set monthly allocation" onClose={()=>setModal('')}><form onSubmit={saveAllocation} className="form-stack"><Field label="Store"><select value={allocationForm.store} onChange={e=>setAllocationForm({...allocationForm,store:e.target.value})}>{STORES.map(s=><option key={s}>{s}</option>)}</select></Field><Field label="Month"><input type="month" value={allocationForm.month} onChange={e=>setAllocationForm({...allocationForm,month:e.target.value})}/></Field><Field label="Allocation amount (₹)"><input type="number" min="0" value={allocationForm.amount} onChange={e=>setAllocationForm({...allocationForm,amount:e.target.value})} required/></Field><button className="primary-btn full">Save allocation</button></form></Modal>}
    {notice&&<div className="toast"><CheckCircle2 size={17}/>{notice}</div>}
  </div>;
}
function Table({headers,rows}){return <div className="table-wrap">{rows.length?<table><thead><tr>{headers.map((h,i)=><th key={i}>{h}</th>)}</tr></thead><tbody>{rows.map((r,i)=><tr key={i}>{r.map((v,j)=><td key={j}>{v}</td>)}</tr>)}</tbody></table>:<div className="empty"><FileText size={24}/><b>No records found</b><span>New entries will appear here.</span></div>}</div>}
