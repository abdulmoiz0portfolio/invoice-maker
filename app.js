// AutomatixInvoice - Vue 3 Reactive SaaS Architecture

const { createApp, ref, computed, onMounted, nextTick } = Vue;

createApp({
  setup() {
    // 1. Theme Management (Dark / Light)
    const isDark = ref(false);

    const applyTheme = (dark) => {
      isDark.value = dark;
      if (dark) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('automatix_invoice_theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('automatix_invoice_theme', 'light');
      }
      nextTick(() => {
        if (window.lucide) lucide.createIcons();
      });
    };

    const toggleTheme = () => {
      applyTheme(!isDark.value);
      showToast(isDark.value ? 'Dark Mode Enabled' : 'Light Mode Enabled');
    };

    // 1.1 Freemium Positioning & Architecture
    const userTier = ref('free'); // 'free' | 'pro'
    const proModalOpen = ref(false);

    // 2. Template Schemes
    const templates = [
      { id: 'modern-indigo', name: 'Indigo SaaS', color: '#4F46E5' },
      { id: 'emerald-growth', name: 'Emerald Tech', color: '#059669' },
      { id: 'executive-slate', name: 'Slate Executive', color: '#0F172A' },
      { id: 'vibrant-coral', name: 'Vibrant Coral', color: '#E11D48' },
      { id: 'automatix-cyber', name: 'Cyber Minimal', color: '#C8E019' }
    ];
    const currentTemplate = ref('modern-indigo');

    // 3. Sender / Company Profile
    const company = ref({
      showLogo: true,
      logo: 'https://www.automatixes.com/assets/img/logo/automatixes-logo-new.png',
      name: 'Automatixes LLC',
      tagline: 'AI Solutions & Workflow Automation',
      address: '71-75 Shelton Street, Covent Garden, London, WC2H 9JQ',
      phone: '+92 336 6920141',
      email: 'contact@automatixes.com',
      website: 'https://automatixes.com',
      taxId: 'US-EIN-9482019'
    });

    // Logo Manager
    const onLogoUpload = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      if (file.size > 3 * 1024 * 1024) {
        showToast('Image must be smaller than 3MB');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        company.value.logo = event.target.result;
        company.value.showLogo = true;
        showToast('Company logo updated!');
        nextTick(() => { if (window.lucide) lucide.createIcons(); });
      };
      reader.readAsDataURL(file);
    };

    const removeLogo = () => {
      company.value.showLogo = false;
      company.value.logo = '';
      showToast('Logo removed successfully!');
      nextTick(() => { if (window.lucide) lucide.createIcons(); });
    };

    // 4. Client & Editable Section Titles
    const sections = ref({
      clientTitle: 'BILLED TO:',
      notesTitle: 'NOTES & PAYMENT INSTRUCTIONS:',
      bankTitle: 'BANK & WIRE TRANSFER:',
      qrTitle: 'SCAN TO PAY / VERIFY:'
    });

    const client = ref({
      name: 'Sarah Jenkins',
      company: 'Apex Digital Global Inc.',
      address: '350 5th Avenue, Suite 2100, New York, NY 10118',
      email: 'billing@apexdigital.io',
      phone: '+1 (555) 234-5678',
      taxId: 'US-TAX-89210'
    });

    // 4.1 Saved Clients Directory
    const savedClients = ref([]);
    const clientsModalOpen = ref(false);

    const loadSavedClientsFromStorage = () => {
      try {
        const stored = localStorage.getItem('automatix_saved_clients_v1');
        if (stored) {
          savedClients.value = JSON.parse(stored);
        } else {
          // Seed initial default clients
          savedClients.value = [
            {
              id: 'client_1',
              name: 'Sarah Jenkins',
              company: 'Apex Digital Global Inc.',
              address: '350 5th Avenue, Suite 2100, New York, NY 10118',
              email: 'billing@apexdigital.io',
              phone: '+1 (555) 234-5678',
              taxId: 'US-TAX-89210'
            },
            {
              id: 'client_2',
              name: 'Liam Harrington',
              company: 'Vertex Technologies UK',
              address: '25 Bank Street, Canary Wharf, London, E14 5JP',
              email: 'accounts@vertextech.co.uk',
              phone: '+44 20 7946 0192',
              taxId: 'GB-VAT-992019'
            },
            {
              id: 'client_3',
              name: 'Tariq Al-Mansoor',
              company: 'Emirates Cloud Solutions',
              address: 'Downtown Dubai, Boulevard Plaza Tower 1, UAE',
              email: 'finance@emiratescloud.ae',
              phone: '+971 4 382 9100',
              taxId: 'AE-TRN-10029482019'
            }
          ];
          localStorage.setItem('automatix_saved_clients_v1', JSON.stringify(savedClients.value));
        }
      } catch (e) {}
    };

    const saveCurrentClient = () => {
      if (!client.value.name && !client.value.company) {
        showToast('Please enter at least a client name or company');
        return;
      }
      const existingIdx = savedClients.value.findIndex(c => 
        (c.email && c.email.toLowerCase() === client.value.email.toLowerCase()) || 
        (c.company && c.company.toLowerCase() === client.value.company.toLowerCase())
      );

      const record = {
        id: existingIdx >= 0 ? savedClients.value[existingIdx].id : 'cli_' + Date.now().toString(36),
        name: client.value.name,
        company: client.value.company,
        address: client.value.address,
        email: client.value.email,
        phone: client.value.phone,
        taxId: client.value.taxId || ''
      };

      if (existingIdx >= 0) {
        savedClients.value[existingIdx] = record;
        showToast(`Updated client ${record.name || record.company} in directory!`);
      } else {
        savedClients.value.unshift(record);
        showToast(`Saved ${record.name || record.company} to Client Directory!`);
      }
      localStorage.setItem('automatix_saved_clients_v1', JSON.stringify(savedClients.value));
    };

    const selectClient = (c) => {
      if (!c) return;
      client.value = {
        name: c.name || '',
        company: c.company || '',
        address: c.address || '',
        email: c.email || '',
        phone: c.phone || '',
        taxId: c.taxId || ''
      };
      showToast(`Loaded client: ${c.name || c.company}`);
    };

    const onClientDropdownChange = (e) => {
      const selectedId = e.target.value;
      if (!selectedId) return;
      const found = savedClients.value.find(c => c.id === selectedId);
      if (found) selectClient(found);
      e.target.value = '';
    };

    const deleteSavedClient = (idx) => {
      const removed = savedClients.value.splice(idx, 1);
      localStorage.setItem('automatix_saved_clients_v1', JSON.stringify(savedClients.value));
      showToast('Client removed from directory');
    };

    // 5. Invoice Metadata & Auto-Incrementing Numbers
    const todayStr = new Date().toISOString().split('T')[0];
    const defaultDue = new Date();
    defaultDue.setDate(defaultDue.getDate() + 14);
    const dueStr = defaultDue.toISOString().split('T')[0];

    const invoice = ref({
      number: 'INV-1001',
      date: todayStr,
      dueDate: dueStr,
      poNumber: 'PO-8842',
      currency: '$',
      taxRate: 5,
      discountRate: 0,
      shipping: 0,
      notes: 'Thank you for your business! Payment is due within 14 days of invoice date. Please transfer funds or scan the payment QR code below.',
      isRecurring: false,
      recurringInterval: 'monthly'
    });

    const nextInvoiceNumber = () => {
      const current = invoice.value.number || 'INV-1000';
      const match = current.match(/^(.*?)(\d+)$/);
      if (match) {
        const prefix = match[1];
        const num = parseInt(match[2], 10) + 1;
        const padded = String(num).padStart(match[2].length, '0');
        invoice.value.number = `${prefix}${padded}`;
      } else {
        invoice.value.number = 'INV-' + (Math.floor(1000 + Math.random() * 9000));
      }
      showToast(`Next invoice number set: ${invoice.value.number}`);
    };

    const duplicateInvoice = () => {
      nextInvoiceNumber();
      invoice.value.date = new Date().toISOString().split('T')[0];
      const nextDue = new Date();
      nextDue.setDate(nextDue.getDate() + 14);
      invoice.value.dueDate = nextDue.toISOString().split('T')[0];
      showToast(`Duplicated invoice! Created ${invoice.value.number}`);
    };

    const generateNextPeriodInvoice = () => {
      nextInvoiceNumber();
      const curDate = new Date(invoice.value.date || Date.now());
      const interval = invoice.value.recurringInterval || 'monthly';
      
      if (interval === 'weekly') {
        curDate.setDate(curDate.getDate() + 7);
      } else if (interval === 'bi-weekly') {
        curDate.setDate(curDate.getDate() + 14);
      } else if (interval === 'monthly') {
        curDate.setMonth(curDate.getMonth() + 1);
      } else if (interval === 'quarterly') {
        curDate.setMonth(curDate.getMonth() + 3);
      } else if (interval === 'annual') {
        curDate.setFullYear(curDate.getFullYear() + 1);
      }

      invoice.value.date = curDate.toISOString().split('T')[0];
      const newDue = new Date(curDate);
      newDue.setDate(newDue.getDate() + 14);
      invoice.value.dueDate = newDue.toISOString().split('T')[0];
      showToast(`Generated next ${interval} recurring invoice (${invoice.value.number})!`);
    };

    // 6. Line Items
    const items = ref([
      {
        name: 'Autonomous AI Agent Architecture',
        desc: 'Custom n8n lead scoring agent with CRM & WhatsApp integration',
        qty: 1,
        rate: 1800.00
      },
      {
        name: 'Enterprise Web Application Development',
        desc: 'Responsive high-speed frontend and API design',
        qty: 1,
        rate: 1200.00
      }
    ]);

    const addItem = () => {
      items.value.push({
        name: 'AI Consulting & Custom Integration',
        desc: 'Technical workflow audit and deployment services',
        qty: 1,
        rate: 500.00
      });
      nextTick(() => {
        if (window.lucide) lucide.createIcons();
      });
    };

    const removeItem = (idx) => {
      if (items.value.length > 1) {
        items.value.splice(idx, 1);
      }
    };

    // 7. Options & Feature Toggles (with Payment QR Code)
    const options = ref({
      showNotes: true,
      showBankDetails: true,
      showTax: true,
      showDiscount: true,
      showShipping: false,
      showSignature: true,
      showWatermark: true,
      showPaymentQR: true
    });

    // 7.1 Cross-Promotion Payment QR Code Embed (powered by AutomatixQR)
    const paymentQR = ref({
      data: 'https://www.automatixes.com/pay/INV-1001',
      label: 'Scan with Camera / Banking App to Pay'
    });

    const paymentQRUrl = computed(() => {
      const payload = paymentQR.value.data && paymentQR.value.data.trim() !== '' 
        ? paymentQR.value.data.trim() 
        : `https://www.automatixes.com/pay/${invoice.value.number || 'invoice'}`;
      return `https://api.qrserver.com/v1/create-qr-code/?size=160x160&margin=0&color=0f172a&data=${encodeURIComponent(payload)}`;
    });

    // 7.2 Country Localization & Tax Presets
    const countryPresets = [
      {
        id: 'global',
        name: 'Global Standard',
        currency: '$',
        taxRate: 0,
        taxLabel: 'Tax ID',
        notes: 'Thank you for your business! Payment is due within 14 days.'
      },
      {
        id: 'us',
        name: 'United States (Sales Tax)',
        currency: '$',
        taxRate: 8.25,
        taxLabel: 'EIN / Tax ID',
        notes: 'Sales tax applied per state nexus. Please remit payment via ACH or wire.'
      },
      {
        id: 'uk',
        name: 'United Kingdom (VAT 20%)',
        currency: '£',
        taxRate: 20,
        taxLabel: 'UK VAT Reg No',
        notes: 'Standard 20% UK VAT included. Payment due upon receipt of invoice.'
      },
      {
        id: 'eu',
        name: 'European Union (VAT 19%)',
        currency: '€',
        taxRate: 19,
        taxLabel: 'EU VAT ID',
        notes: 'EU Reverse charge mechanism applies where cross-border B2B supply is valid.'
      },
      {
        id: 'uae',
        name: 'UAE & GCC (VAT 5%)',
        currency: 'AED',
        taxRate: 5,
        taxLabel: 'Tax Reg TRN',
        notes: 'FTA compliant 5% UAE VAT invoice. Please transfer to Emirates NBD account.'
      },
      {
        id: 'pk',
        name: 'Pakistan (Sales Tax 18%)',
        currency: 'Rs',
        taxRate: 18,
        taxLabel: 'NTN / STRN',
        notes: 'FBR compliant sales tax invoice. Bank transfer to Habib Bank Limited.'
      },
      {
        id: 'in',
        name: 'India (GST 18%)',
        currency: '₹',
        taxRate: 18,
        taxLabel: 'GSTIN',
        notes: '18% GST (CGST + SGST) applicable. Remit via NEFT / RTGS / UPI.'
      },
      {
        id: 'ca',
        name: 'Canada (HST/GST 13%)',
        currency: 'C$',
        taxRate: 13,
        taxLabel: 'CRA Business No',
        notes: 'HST # included. Remit payment via Interac e-Transfer or direct wire.'
      }
    ];

    const applyCountryPreset = (preset) => {
      if (!preset) return;
      invoice.value.currency = preset.currency;
      invoice.value.taxRate = preset.taxRate;
      company.value.taxId = company.value.taxId || preset.taxLabel;
      if (preset.notes) invoice.value.notes = preset.notes;
      showToast(`Applied ${preset.name} Localization Preset!`);
    };

    // 8. Bank Transfer Details
    const bank = ref({
      name: 'JPMorgan Chase Bank',
      iban: 'GB29 CHAS 0928 3829 1029 48',
      swift: 'CHASUS33XXX',
      holder: 'Automatixes LLC'
    });

    // 9. Authorized Signature
    const signature = ref({
      name: 'Abdul Moiz',
      title: 'Managing Director'
    });

    // 10. Calculations
    const subtotal = computed(() => {
      return items.value.reduce((acc, item) => {
        const q = parseFloat(item.qty) || 0;
        const r = parseFloat(item.rate) || 0;
        return acc + (q * r);
      }, 0);
    });

    const taxAmount = computed(() => {
      if (!options.value.showTax) return 0;
      const rate = parseFloat(invoice.value.taxRate) || 0;
      return (subtotal.value * rate) / 100;
    });

    const discountAmount = computed(() => {
      if (!options.value.showDiscount) return 0;
      const rate = parseFloat(invoice.value.discountRate) || 0;
      return (subtotal.value * rate) / 100;
    });

    const grandTotal = computed(() => {
      const ship = options.value.showShipping ? (parseFloat(invoice.value.shipping) || 0) : 0;
      return Math.max(0, subtotal.value + taxAmount.value - discountAmount.value + ship);
    });

    const formatMoney = (val) => {
      const num = parseFloat(val) || 0;
      return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    // 11. Toast System
    const showToast = (msg) => {
      const toast = document.getElementById('toast');
      const toastMsg = document.getElementById('toast-message');
      if (!toast || !toastMsg) return;
      toastMsg.textContent = msg;
      toast.classList.remove('opacity-0', 'translate-y-20', 'pointer-events-none');
      toast.classList.add('opacity-100', 'translate-y-0');
      setTimeout(() => {
        toast.classList.remove('opacity-100', 'translate-y-0');
        toast.classList.add('opacity-0', 'translate-y-20', 'pointer-events-none');
      }, 3000);
    };

    // 12. Saved Invoices History
    const drawerOpen = ref(false);
    const savedInvoices = ref([]);

    const loadSavedInvoicesFromStorage = () => {
      try {
        const stored = localStorage.getItem('automatix_saved_invoices_v1');
        if (stored) {
          savedInvoices.value = JSON.parse(stored);
        }
      } catch (e) {}
    };

    const saveInvoiceToLibrary = () => {
      const record = {
        id: 'inv_' + Date.now().toString(36),
        savedAt: new Date().toISOString(),
        total: grandTotal.value,
        template: currentTemplate.value,
        company: JSON.parse(JSON.stringify(company.value)),
        sections: JSON.parse(JSON.stringify(sections.value)),
        client: JSON.parse(JSON.stringify(client.value)),
        invoice: JSON.parse(JSON.stringify(invoice.value)),
        items: JSON.parse(JSON.stringify(items.value)),
        options: JSON.parse(JSON.stringify(options.value)),
        bank: JSON.parse(JSON.stringify(bank.value)),
        signature: JSON.parse(JSON.stringify(signature.value))
      };

      savedInvoices.value.unshift(record);
      if (savedInvoices.value.length > 50) savedInvoices.value.pop();
      localStorage.setItem('automatix_saved_invoices_v1', JSON.stringify(savedInvoices.value));
      showToast(`Invoice ${invoice.value.number} saved to Library!`);
    };

    const loadSavedInvoice = (rec) => {
      if (!rec) return;
      currentTemplate.value = rec.template || 'modern-indigo';
      company.value = rec.company;
      if (rec.sections) sections.value = rec.sections;
      client.value = rec.client;
      invoice.value = rec.invoice;
      items.value = rec.items;
      options.value = rec.options || options.value;
      bank.value = rec.bank || bank.value;
      signature.value = rec.signature || signature.value;
      drawerOpen.value = false;
      showToast(`Loaded invoice ${rec.invoice.number}`);
      nextTick(() => {
        if (window.lucide) lucide.createIcons();
      });
    };

    const deleteSavedInvoice = (idx) => {
      savedInvoices.value.splice(idx, 1);
      localStorage.setItem('automatix_saved_invoices_v1', JSON.stringify(savedInvoices.value));
      showToast('Invoice deleted from library');
    };

    // 13. Export & Import JSON
    const exportJSON = () => {
      const data = {
        version: '1.0',
        exportedAt: new Date().toISOString(),
        template: currentTemplate.value,
        company: company.value,
        sections: sections.value,
        client: client.value,
        invoice: invoice.value,
        items: items.value,
        options: options.value,
        bank: bank.value,
        signature: signature.value
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${invoice.value.number || 'invoice'}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('Invoice exported as JSON');
    };

    const importJSON = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target.result);
          if (parsed.company) company.value = parsed.company;
          if (parsed.sections) sections.value = parsed.sections;
          if (parsed.client) client.value = parsed.client;
          if (parsed.invoice) invoice.value = parsed.invoice;
          if (parsed.items) items.value = parsed.items;
          if (parsed.options) options.value = parsed.options;
          if (parsed.bank) bank.value = parsed.bank;
          if (parsed.signature) signature.value = parsed.signature;
          if (parsed.template) currentTemplate.value = parsed.template;
          showToast('Invoice imported successfully!');
        } catch (err) {
          showToast('Invalid JSON file format');
        }
      };
      reader.readAsText(file);
    };

    // 14. Reset Form
    const resetForm = () => {
      invoice.value.number = 'INV-' + Math.floor(1000 + Math.random() * 9000);
      invoice.value.date = todayStr;
      invoice.value.dueDate = dueStr;
      invoice.value.poNumber = '';
      invoice.value.taxRate = 5;
      invoice.value.discountRate = 0;
      invoice.value.shipping = 0;
      client.value = { name: '', company: '', address: '', email: '', phone: '' };
      items.value = [
        {
          name: 'Professional Consulting Services',
          desc: 'Deliverables and scope breakdown',
          qty: 1,
          rate: 1000.00
        }
      ];
      showToast('Invoice reset to blank draft');
    };

    // 15. Print Action
    const triggerPrint = () => {
      window.print();
    };

    // 16. Universal Click Ripple Effect
    const initRipple = () => {
      document.addEventListener('click', (e) => {
        const btn = e.target.closest('button, .btn, a.btn');
        if (!btn) return;

        const style = window.getComputedStyle(btn);
        if (style.position === 'static') btn.style.position = 'relative';
        if (style.overflow !== 'hidden') btn.style.overflow = 'hidden';

        const circle = document.createElement('span');
        const diameter = Math.max(btn.clientWidth, btn.clientHeight);
        const radius = diameter / 2;
        const rect = btn.getBoundingClientRect();

        circle.style.width = circle.style.height = `${diameter}px`;
        circle.style.left = `${e.clientX - rect.left - radius}px`;
        circle.style.top = `${e.clientY - rect.top - radius}px`;
        circle.classList.add('ripple-wave');

        const prev = btn.querySelector('.ripple-wave');
        if (prev) prev.remove();

        btn.appendChild(circle);
        setTimeout(() => circle.remove(), 600);
      });
    };

    onMounted(() => {
      // Initialize Lenis Smooth Inertia Scroll (Option 2: Gliding Inertia)
      if (typeof Lenis !== 'undefined') {
        const lenis = new Lenis({
          lerp: 0.1,
          duration: 1.1,
          smoothWheel: true,
          wheelMultiplier: 1.0,
          touchMultiplier: 1.0,
          infinite: false
        });
        function raf(time) {
          lenis.raf(time);
          requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);
        window.lenis = lenis;
      }

      const savedTheme = localStorage.getItem('automatix_invoice_theme');
      if (savedTheme === 'dark') {
        applyTheme(true);
      } else {
        applyTheme(false);
      }
      loadSavedInvoicesFromStorage();
      loadSavedClientsFromStorage();
      initRipple();
      if (window.lucide) lucide.createIcons();
    });

    return {
      isDark,
      toggleTheme,
      userTier,
      proModalOpen,
      templates,
      currentTemplate,
      company,
      onLogoUpload,
      removeLogo,
      sections,
      client,
      savedClients,
      clientsModalOpen,
      saveCurrentClient,
      selectClient,
      onClientDropdownChange,
      deleteSavedClient,
      invoice,
      nextInvoiceNumber,
      duplicateInvoice,
      generateNextPeriodInvoice,
      items,
      addItem,
      removeItem,
      options,
      paymentQR,
      paymentQRUrl,
      countryPresets,
      applyCountryPreset,
      bank,
      signature,
      subtotal,
      taxAmount,
      discountAmount,
      grandTotal,
      formatMoney,
      showToast,
      drawerOpen,
      savedInvoices,
      saveInvoiceToLibrary,
      loadSavedInvoice,
      deleteSavedInvoice,
      exportJSON,
      importJSON,
      resetForm,
      triggerPrint
    };
  }
}).mount('#app');
