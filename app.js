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
      };
      reader.readAsDataURL(file);
    };

    const removeLogo = () => {
      company.value.showLogo = false;
      company.value.logo = '';
      showToast('Logo removed');
    };

    // 4. Client / Customer Details
    const client = ref({
      name: 'Sarah Jenkins',
      company: 'Apex Digital Global Inc.',
      address: '350 5th Avenue, Suite 2100, New York, NY 10118',
      email: 'billing@apexdigital.io',
      phone: '+1 (555) 234-5678'
    });

    // 5. Invoice Metadata & Dates
    const todayStr = new Date().toISOString().split('T')[0];
    const defaultDue = new Date();
    defaultDue.setDate(defaultDue.getDate() + 14);
    const dueStr = defaultDue.toISOString().split('T')[0];

    const invoice = ref({
      number: 'INV-' + Math.floor(1000 + Math.random() * 9000),
      date: todayStr,
      dueDate: dueStr,
      poNumber: 'PO-8842',
      currency: '$',
      taxRate: 5,
      discountRate: 0,
      shipping: 0,
      notes: 'Thank you for your business! Payment is due within 14 days of invoice date. Please transfer funds to the bank account listed below.'
    });

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

    // 7. Options & Feature Toggles
    const options = ref({
      showTax: true,
      showDiscount: true,
      showShipping: false,
      showBankDetails: true,
      showSignature: true,
      showWatermark: true
    });

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
        const q = Number(item.qty) || 0;
        const r = Number(item.rate) || 0;
        return acc + (q * r);
      }, 0);
    });

    const taxAmount = computed(() => {
      if (!options.value.showTax) return 0;
      const rate = Number(invoice.value.taxRate) || 0;
      return subtotal.value * (rate / 100);
    });

    const discountAmount = computed(() => {
      if (!options.value.showDiscount) return 0;
      const rate = Number(invoice.value.discountRate) || 0;
      return subtotal.value * (rate / 100);
    });

    const grandTotal = computed(() => {
      const ship = options.value.showShipping ? (Number(invoice.value.shipping) || 0) : 0;
      return Math.max(0, subtotal.value + taxAmount.value - discountAmount.value + ship);
    });

    const formatMoney = (val) => {
      const num = Number(val) || 0;
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
      const savedTheme = localStorage.getItem('automatix_invoice_theme');
      if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        applyTheme(true);
      } else {
        applyTheme(false);
      }
      loadSavedInvoicesFromStorage();
      initRipple();
      if (window.lucide) lucide.createIcons();
    });

    return {
      isDark,
      toggleTheme,
      templates,
      currentTemplate,
      company,
      onLogoUpload,
      removeLogo,
      client,
      invoice,
      items,
      addItem,
      removeItem,
      options,
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
