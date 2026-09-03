const { createApp, ref, computed, watch, onMounted, nextTick } = Vue;

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

    // 2. Advanced UX & Branding Controls (Pillar 1)
    const layoutTemplate = ref('modern'); // 'modern' | 'corporate' | 'minimalist'
    const pageFormat = ref('a4'); // 'a4' | 'letter'
    const customColor = ref('#4F46E5');

    const colorPresets = [
      { id: 'indigo', name: 'Indigo SaaS', color: '#4F46E5' },
      { id: 'emerald', name: 'Emerald Tech', color: '#059669' },
      { id: 'navy', name: 'Executive Navy', color: '#0F172A' },
      { id: 'coral', name: 'Vibrant Coral', color: '#E11D48' },
      { id: 'amber', name: 'Warm Amber', color: '#D97706' },
      { id: 'cyber', name: 'Cyber Green', color: '#15803D' },
      { id: 'purple', name: 'Royal Purple', color: '#7C3AED' }
    ];

    const hexToRgba = (hex, alpha) => {
      if (!hex) return `rgba(79, 70, 229, ${alpha})`;
      let c = hex.replace('#', '');
      if (c.length === 3) c = c.split('').map(x => x + x).join('');
      if (c.length !== 6) return `rgba(79, 70, 229, ${alpha})`;
      const num = parseInt(c, 16);
      return `rgba(${(num >> 16) & 255}, ${(num >> 8) & 255}, ${num & 255}, ${alpha})`;
    };

    const sheetStyles = computed(() => {
      const accent = customColor.value || '#4F46E5';
      return {
        '--theme-accent': accent,
        '--theme-accent-light': hexToRgba(accent, 0.08),
        '--theme-accent-border': hexToRgba(accent, 0.25)
      };
    });

    const selectPresetColor = (hex) => {
      customColor.value = hex;
      showToast(`Applied brand accent: ${hex}`);
    };

    // Backward-compatibility template alias
    const currentTemplate = computed(() => layoutTemplate.value);
    const templates = colorPresets;

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
      taxName: 'Tax',
      taxRate: 5,
      taxType: 'exclusive', // 'exclusive' | 'inclusive'
      discountRate: 0,
      shipping: 0,
      notes: 'Thank you for your business! Payment is due within 14 days of invoice date. Please transfer funds or scan the payment QR code below.',
      isRecurring: false,
      recurringInterval: 'monthly'
    });

    const nextInvoiceNumber = () => {
      let maxNum = 0;
      let prefix = 'INV-';
      let padLen = 4;

      const scanNumber = (str) => {
        if (!str) return;
        const match = String(str).match(/^(.*?)(\d+)$/);
        if (match) {
          const p = match[1];
          const n = parseInt(match[2], 10);
          if (n > maxNum) {
            maxNum = n;
            prefix = p;
            padLen = match[2].length;
          }
        }
      };

      scanNumber(invoice.value.number);
      if (savedInvoices.value) {
        savedInvoices.value.forEach(item => {
          if (item.invoice && item.invoice.number) {
            scanNumber(item.invoice.number);
          }
        });
      }

      if (maxNum > 0) {
        invoice.value.number = `${prefix}${String(maxNum + 1).padStart(padLen, '0')}`;
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

    // 6. Line Items (Supports both quantity and qty)
    const items = ref([
      {
        description: 'Autonomous AI Agent Architecture',
        quantity: 1,
        rate: 1800.00
      },
      {
        description: 'Enterprise Web Application Development',
        quantity: 1,
        rate: 1200.00
      }
    ]);

    const addItem = () => {
      items.value.push({
        description: 'AI Consulting & Custom Integration',
        quantity: 1,
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
      showNotes: true,
      showBankDetails: true,
      showTax: true,
      showDiscount: true,
      showShipping: false,
      showSignature: true,
      showWatermark: true,
      showPaymentQR: true,
      showPoweredBy: true
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
      { id: 'global', name: 'Global Standard', currency: '$', taxRate: 0, taxLabel: 'Tax ID', taxType: 'exclusive' },
      { id: 'us', name: 'United States (Sales Tax)', currency: '$', taxRate: 8.25, taxLabel: 'EIN / Tax ID', taxType: 'exclusive' },
      { id: 'uk', name: 'United Kingdom (VAT 20%)', currency: '£', taxRate: 20, taxLabel: 'UK VAT Reg No', taxType: 'inclusive' },
      { id: 'eu', name: 'European Union (VAT 19%)', currency: '€', taxRate: 19, taxLabel: 'EU VAT ID', taxType: 'inclusive' },
      { id: 'uae', name: 'UAE & GCC (VAT 5%)', currency: 'AED', taxRate: 5, taxLabel: 'Tax Reg TRN', taxType: 'exclusive' },
      { id: 'pk', name: 'Pakistan (Sales Tax 18%)', currency: 'Rs', taxRate: 18, taxLabel: 'NTN / STRN', taxType: 'exclusive' },
      { id: 'in', name: 'India (GST 18%)', currency: '₹', taxRate: 18, taxLabel: 'GSTIN', taxType: 'inclusive' },
      { id: 'ca', name: 'Canada (HST/GST 13%)', currency: 'C$', taxRate: 13, taxLabel: 'CRA Business No', taxType: 'exclusive' }
    ];

    const applyCountryPreset = (preset) => {
      if (!preset) return;
      invoice.value.currency = preset.currency;
      invoice.value.taxRate = preset.taxRate;
      invoice.value.taxType = preset.taxType || 'exclusive';
      company.value.taxId = company.value.taxId || preset.taxLabel;
      if (preset.notes) invoice.value.notes = preset.notes;
      saveBusinessProfile();
      showToast(`Applied ${preset.name} Localization Preset!`);
    };

    // 8. Bank Transfer Details
    const defaultBank = {
      name: 'JPMorgan Chase Bank',
      iban: 'GB29 CHAS 0928 3829 1029 48',
      swift: 'CHASUS33XXX',
      holder: 'Automatixes LLC'
    };
    const bank = ref({ ...defaultBank });

    // 9. Authorized Signature
    const defaultSignature = {
      name: 'Abdul Moiz',
      title: 'Managing Director'
    };
    const signature = ref({ ...defaultSignature });

    // 10. Smart Calculations (Exclusive vs Inclusive Tax)
    const subtotal = computed(() => {
      return items.value.reduce((acc, item) => {
        const q = parseFloat(item.quantity !== undefined ? item.quantity : item.qty) || 0;
        const r = parseFloat(item.rate) || 0;
        return acc + (q * r);
      }, 0);
    });

    const taxAmount = computed(() => {
      if (!options.value.showTax) return 0;
      const rate = parseFloat(invoice.value.taxRate) || 0;
      if (invoice.value.taxType === 'inclusive') {
        // Line items include tax: Tax = Subtotal - (Subtotal / (1 + rate / 100))
        return subtotal.value - (subtotal.value / (1 + (rate / 100)));
      } else {
        // Standard exclusive tax: Tax = Subtotal * (rate / 100)
        return (subtotal.value * rate) / 100;
      }
    });

    const netSubtotal = computed(() => {
      if (invoice.value.taxType === 'inclusive') {
        return Math.max(0, subtotal.value - taxAmount.value);
      }
      return subtotal.value;
    });

    const discountAmount = computed(() => {
      if (!options.value.showDiscount) return 0;
      const rate = parseFloat(invoice.value.discountRate) || 0;
      return (subtotal.value * rate) / 100;
    });

    const grandTotal = computed(() => {
      const ship = options.value.showShipping ? (parseFloat(invoice.value.shipping) || 0) : 0;
      if (invoice.value.taxType === 'inclusive') {
        // Tax is already in subtotal, so total is subtotal - discount + ship
        return Math.max(0, subtotal.value - discountAmount.value + ship);
      } else {
        // Exclusive tax is added to subtotal
        return Math.max(0, subtotal.value + taxAmount.value - discountAmount.value + ship);
      }
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
      }, 3200);
    };

    // 12. Robust Data Persistence (Pillar 2 - Zero Friction Auto-Save)
    const isProfileSavedLocally = ref(false);
    const PROFILE_KEY = 'automatix_business_profile_v2';
    const DRAFT_KEY = 'automatix_active_draft_v2';

    const saveBusinessProfile = () => {
      try {
        const payload = {
          company: company.value,
          bank: bank.value,
          signature: signature.value,
          currency: invoice.value.currency,
          taxType: invoice.value.taxType,
          customColor: customColor.value,
          layoutTemplate: layoutTemplate.value,
          pageFormat: pageFormat.value,
          options: options.value
        };
        localStorage.setItem(PROFILE_KEY, JSON.stringify(payload));
        isProfileSavedLocally.value = true;
      } catch (e) {}
    };

    const loadBusinessProfile = () => {
      try {
        const stored = localStorage.getItem(PROFILE_KEY);
        if (stored) {
          const data = JSON.parse(stored);
          if (data.company) company.value = { ...defaultCompany, ...data.company };
          if (data.bank) bank.value = { ...defaultBank, ...data.bank };
          if (data.signature) signature.value = { ...defaultSignature, ...data.signature };
          if (data.currency) invoice.value.currency = data.currency;
          if (data.taxType) invoice.value.taxType = data.taxType;
          if (data.customColor) customColor.value = data.customColor;
          if (data.layoutTemplate) layoutTemplate.value = data.layoutTemplate;
          if (data.pageFormat) pageFormat.value = data.pageFormat;
          if (data.options) options.value = { ...options.value, ...data.options };
          isProfileSavedLocally.value = true;
        }
      } catch (e) {}
    };

    const resetBusinessProfile = () => {
      localStorage.removeItem(PROFILE_KEY);
      company.value = { ...defaultCompany };
      bank.value = { ...defaultBank };
      signature.value = { ...defaultSignature };
      customColor.value = '#4F46E5';
      layoutTemplate.value = 'modern';
      pageFormat.value = 'a4';
      isProfileSavedLocally.value = false;
      showToast('Business profile reset to default!');
    };

    // Auto-save watchers
    watch([company, bank, signature, customColor, layoutTemplate, pageFormat], () => {
      saveBusinessProfile();
    }, { deep: true });

    watch(webhookModalOpen, (open) => {
      if (open) {
        nextTick(() => {
          if (window.lucide) lucide.createIcons();
        });
      }
    });

    watch([invoice, client, items], () => {
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify({
          invoice: invoice.value,
          client: client.value,
          items: items.value
        }));
      } catch (e) {}
    }, { deep: true });

    const loadActiveDraft = () => {
      try {
        const stored = localStorage.getItem(DRAFT_KEY);
        if (stored) {
          const d = JSON.parse(stored);
          if (d.invoice) invoice.value = { ...invoice.value, ...d.invoice };
          if (d.client) client.value = { ...client.value, ...d.client };
          if (d.items && d.items.length) items.value = d.items;
        }
      } catch (e) {}
    };

    // 13. Saved Invoices History (Library)
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
        layoutTemplate: layoutTemplate.value,
        customColor: customColor.value,
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
      if (rec.layoutTemplate) layoutTemplate.value = rec.layoutTemplate;
      if (rec.customColor) customColor.value = rec.customColor;
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

    // 14. Webhook & CRM Automation Engine (Pillar 4 - Agency Integration)
    const webhookModalOpen = ref(false);
    const webhookUrl = ref('');
    const webhookStatus = ref('idle'); // 'idle' | 'sending' | 'success' | 'error'
    const webhookMessage = ref('');

    const loadWebhookSettings = () => {
      try {
        const stored = localStorage.getItem('automatix_webhook_url_v1');
        if (stored) webhookUrl.value = stored;
      } catch (e) {}
    };

    const sendToWebhook = async () => {
      if (!webhookUrl.value || !webhookUrl.value.startsWith('http')) {
        showToast('Please enter a valid HTTP/HTTPS Webhook URL');
        return;
      }

      webhookStatus.value = 'sending';
      webhookMessage.value = 'Transmitting structured invoice JSON...';

      const payload = {
        event: 'invoice.created',
        invoiceNumber: invoice.value.number,
        date: invoice.value.date,
        dueDate: invoice.value.dueDate,
        poNumber: invoice.value.poNumber,
        currency: invoice.value.currency,
        taxType: invoice.value.taxType,
        taxRate: invoice.value.taxRate,
        taxAmount: taxAmount.value,
        discountRate: invoice.value.discountRate,
        discountAmount: discountAmount.value,
        shipping: invoice.value.shipping,
        subtotal: subtotal.value,
        grandTotal: grandTotal.value,
        company: {
          name: company.value.name,
          email: company.value.email,
          phone: company.value.phone,
          taxId: company.value.taxId
        },
        client: client.value,
        items: items.value,
        paymentLink: paymentQR.value.data,
        timestamp: new Date().toISOString(),
        source: 'AutomatixInvoice by Automatixes'
      };

      try {
        localStorage.setItem('automatix_webhook_url_v1', webhookUrl.value);
        const res = await fetch(webhookUrl.value, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (res.ok) {
          webhookStatus.value = 'success';
          webhookMessage.value = `Webhook received successfully (${res.status} ${res.statusText})!`;
          showToast(`Invoice ${invoice.value.number} pushed to Webhook!`);
        } else {
          webhookStatus.value = 'error';
          webhookMessage.value = `Server responded with HTTP ${res.status}`;
        }
      } catch (err) {
        webhookStatus.value = 'error';
        webhookMessage.value = `Network or CORS error: ${err.message}`;
      }
    };

    // 15. One-Click Email to Client
    const emailInvoiceToClient = () => {
      const recipient = client.value.email || '';
      const subject = encodeURIComponent(`Invoice ${invoice.value.number} from ${company.value.name || 'Automatixes'}`);
      const body = encodeURIComponent(
        `Hi ${client.value.name || 'Valued Client'},\n\n` +
        `Please find the details for Invoice ${invoice.value.number} below:\n\n` +
        `• Invoice Date: ${invoice.value.date}\n` +
        `• Due Date: ${invoice.value.dueDate}\n` +
        `• Total Due: ${invoice.value.currency} ${formatMoney(grandTotal.value)}\n\n` +
        `Notes: ${invoice.value.notes}\n\n` +
        `Thank you for your business!\n\n` +
        `Best regards,\n` +
        `${company.value.name}\n` +
        `${company.value.phone || ''}`
      );
      window.open(`mailto:${recipient}?subject=${subject}&body=${body}`, '_blank');
      showToast('Opened prefilled email draft!');
    };

    // 16. JSON Export / Import
    const exportJSON = () => {
      const data = {
        version: '2.0',
        exportedAt: new Date().toISOString(),
        layoutTemplate: layoutTemplate.value,
        customColor: customColor.value,
        pageFormat: pageFormat.value,
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
          if (parsed.customColor) customColor.value = parsed.customColor;
          if (parsed.layoutTemplate) layoutTemplate.value = parsed.layoutTemplate;
          if (parsed.pageFormat) pageFormat.value = parsed.pageFormat;
          showToast('Invoice imported successfully!');
        } catch (err) {
          showToast('Invalid JSON file format');
        }
      };
      reader.readAsText(file);
    };

    // 17. Reset Form
    const resetForm = () => {
      invoice.value.number = 'INV-' + Math.floor(1000 + Math.random() * 9000);
      invoice.value.date = todayStr;
      invoice.value.dueDate = dueStr;
      invoice.value.poNumber = '';
      invoice.value.taxRate = 5;
      invoice.value.discountRate = 0;
      invoice.value.shipping = 0;
      client.value = { name: '', company: '', address: '', email: '', phone: '', taxId: '' };
      items.value = [
        {
          description: 'Professional Consulting Services',
          quantity: 1,
          rate: 1000.00
        }
      ];
      showToast('Invoice draft cleared');
    };

    // 18. Print Action
    const triggerPrint = () => {
      window.print();
    };

    // 19. Universal Click Ripple Effect
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
      if (typeof Lenis !== 'undefined') {
        const lenis = new Lenis({ lerp: 0.1, duration: 1.1, smoothWheel: true });
        function raf(time) {
          lenis.raf(time);
          requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);
        window.lenis = lenis;
      }

      const savedTheme = localStorage.getItem('automatix_invoice_theme');
      if (savedTheme === 'light') {
        applyTheme(false);
      } else {
        applyTheme(true);
      }

      loadBusinessProfile();
      loadActiveDraft();
      loadSavedInvoicesFromStorage();
      loadSavedClientsFromStorage();
      loadWebhookSettings();
      initRipple();
      if (window.lucide) lucide.createIcons();
    });

    return {
      isDark,
      toggleTheme,
      userTier,
      proModalOpen,
      layoutTemplate,
      pageFormat,
      customColor,
      colorPresets,
      selectPresetColor,
      sheetStyles,
      company,
      onLogoUpload,
      removeLogo,
      isProfileSavedLocally,
      saveBusinessProfile,
      resetBusinessProfile,
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
      netSubtotal,
      discountAmount,
      grandTotal,
      formatMoney,
      showToast,
      drawerOpen,
      savedInvoices,
      saveInvoiceToLibrary,
      loadSavedInvoice,
      deleteSavedInvoice,
      webhookModalOpen,
      webhookUrl,
      webhookStatus,
      webhookMessage,
      sendToWebhook,
      emailInvoiceToClient,
      exportJSON,
      importJSON,
      resetForm,
      triggerPrint,
      templates,
      currentTemplate
    };
  }
}).mount('#app');
