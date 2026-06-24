// ==================== CONSTANTES ====================
const TVA_RATE = 0.18; // 18%
const DEVIS_KEY = 'njeeygu_devis';
const PRODUCTS_KEY = 'njeeygu_products';
const INVOICES_KEY = 'njeeygu_invoices';
const CLIENTS_KEY = 'njeeygu_clients';
const STOCK_MOVEMENTS_KEY = 'njeeygu_stock_movements';
const EMPLOYEES_KEY = 'njeeygu_employees';
const PAYMENTS_KEY = 'njeeygu_payments';
const TEAM_KEY = 'njeeygu_team';
const SERVICES_KEY = 'njeeygu_services';
const SETTINGS_KEY = 'njeeygu_settings';

// Données
let devis = [];
let products = [];
let invoices = [];
let clients = [];
let stockMovements = [];
let employees = [];
let payments = [];
let team = [];
let services = [];
let settings = {
    companyName: 'NJEEYGU - Le Grand Jour',
    companyEmail: 'contact@njeeygu.sn',
    companyPhone: '+221 77 544 97 95',
    companyAddress: '123 Rue Principale, Saint-Louis',
    companyWhatsapp: '221775449795',
    currency: 'FCFA',
    tvaRate: 18,
    defaultStockAlert: 5
};

let currentDevisId = null;
let currentInvoiceId = null;
let currentStockProductId = null;
let currentInvoiceData = null;
let currentPayslipData = null;

// ==================== FONCTION CENTRALISÉE DE MISE À JOUR ====================
function refreshAllUI() {
    console.log('🔄 Mise à jour automatique de l\'interface...');
    
    // Mettre à jour toutes les interfaces selon la section active
    const activeSection = document.querySelector('.admin-section[style*="display: block"]')?.id || 'section-dashboard';
    
    if (activeSection.includes('dashboard')) {
        updateStats();
        updateBadges();
        updateRecentDevisTable();
        updateRecentInvoices();
    }
    if (activeSection.includes('devis')) {
        updateDevisTables();
        updateDevisStats();
    }
    if (activeSection.includes('produits')) {
        refreshAllUI();
        updateProductsTable();
    }
    if (activeSection.includes('stock')) {
        updateStockTable();
        updateStockMovementsTable();
        updateStockStats();
    }
    if (activeSection.includes('factures')) {
        updateInvoicesTable();
        updateInvoiceStats();
        updateRecentInvoices();
    }
    if (activeSection.includes('clients')) {
        updateClientsTable();
    }
    if (activeSection.includes('services')) {
        updateServicesTable();
    }
    if (activeSection.includes('equipe')) {
        initTeamUI();
    }
    if (activeSection.includes('salaires')) {
        updateSalariesUI();
    }
    
    // Toujours mettre à jour les badges et stats générales
    updateBadges();
    updateStockAlerts();
    
    console.log('✅ Interface mise à jour avec succès');
}

// ==================== FONCTIONS DE SAUVEGARDE GÉNÉRIQUES ====================
function saveData(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
    refreshAllUI();
}

function saveDevis() {
    saveData(DEVIS_KEY, devis);
    updateClientsFromDevisAndInvoices();
}

function saveProducts() {
    saveData(PRODUCTS_KEY, products);
}

function saveInvoices() {
    saveData(INVOICES_KEY, invoices);
    updateClientsFromDevisAndInvoices();
}

function saveClients() {
    saveData(CLIENTS_KEY, clients);
}

function saveStockMovements() {
    saveData(STOCK_MOVEMENTS_KEY, stockMovements);
}

function saveEmployees() {
    saveData(EMPLOYEES_KEY, employees);
}

function savePayments() {
    saveData(PAYMENTS_KEY, payments);
}

function saveTeam() {
    saveData(TEAM_KEY, team);
}

function saveServices() {
    saveData(SERVICES_KEY, services);
}

function saveSettings() {
    saveData(SETTINGS_KEY, settings);
}

// ==================== FONCTIONS TVA ====================
function calculateTTC(priceHT) {
    return priceHT * (1 + TVA_RATE);
}

function calculateTVA(priceHT) {
    return priceHT * TVA_RATE;
}

function updatePriceTTC() {
    const priceHT = parseFloat(document.getElementById('productPriceHT').value) || 0;
    const priceTTC = calculateTTC(priceHT);
    document.getElementById('productPriceTTC').value = Math.round(priceTTC).toLocaleString('fr-FR');
}

function updateServicePriceTTC() {
    const priceHT = parseFloat(document.getElementById('servicePriceHT').value) || 0;
    const priceTTC = calculateTTC(priceHT);
    document.getElementById('servicePriceTTC').value = Math.round(priceTTC).toLocaleString('fr-FR') + ' FCFA';
}

// ==================== INITIALISATION DES DONNÉES ====================
function initDevis() {
    const stored = localStorage.getItem(DEVIS_KEY);
    if (stored) {
        try {
            devis = JSON.parse(stored);
            devis.forEach(d => {
                if (!d.status) d.status = 'pending';
                if (!d.notes) d.notes = '';
            });
        } catch (e) {
            console.error('Erreur parsing devis:', e);
            devis = [];
        }
    } else {
        localStorage.setItem(DEVIS_KEY, JSON.stringify(devis));
    }
}

function initProducts() {
    const stored = localStorage.getItem(PRODUCTS_KEY);
    if (stored) {
        products = JSON.parse(stored);
    } else {
        localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
    }
}

function initInvoices() {
    const stored = localStorage.getItem(INVOICES_KEY);
    if (stored) {
        invoices = JSON.parse(stored);
    } else {
        invoices = [];
        localStorage.setItem(INVOICES_KEY, JSON.stringify(invoices));
    }
}

function initClients() {
    const stored = localStorage.getItem(CLIENTS_KEY);
    if (stored) {
        clients = JSON.parse(stored);
    } else {
        clients = [];
        localStorage.setItem(CLIENTS_KEY, JSON.stringify(clients));
    }
    updateClientsFromDevisAndInvoices();
}

function initServices() {
    const stored = localStorage.getItem(SERVICES_KEY);
    if (stored) {
        services = JSON.parse(stored);
    } else {
        services = [
            {
                id: 1,
                name: 'Mariage',
                description: 'Décoration complète de cérémonie',
                priceHT: 250000,
                priceTTC: calculateTTC(250000)
            },
            {
                id: 2,
                name: 'Événements Professionnels',
                description: 'Séminaires, inaugurations',
                priceHT: 150000,
                priceTTC: calculateTTC(150000)
            },
            {
                id: 3,
                name: 'Événements Privés',
                description: 'Baptêmes, anniversaires',
                priceHT: 150000,
                priceTTC: calculateTTC(150000)
            }
        ];
        localStorage.setItem(SERVICES_KEY, JSON.stringify(services));
    }
}

function initEmployees() {
    const stored = localStorage.getItem(EMPLOYEES_KEY);
    if (stored) {
        employees = JSON.parse(stored);
    } else {
        localStorage.setItem(EMPLOYEES_KEY, JSON.stringify(employees));
    }
}

function initPayments() {
    const stored = localStorage.getItem(PAYMENTS_KEY);
    if (stored) {
        payments = JSON.parse(stored);
    } else {
        const today = new Date();
        payments = [];
        
        for (let i = 0; i < 3; i++) {
            const month = today.getMonth() - i;
            const year = today.getFullYear();
            const paymentDate = new Date(year, month, 28);
            
            employees.forEach(emp => {
                const bonus = i === 0 ? emp.defaultBonus * 1.2 : emp.defaultBonus;
                
                payments.push({
                    id: payments.length + 1,
                    employeeId: emp.id,
                    employeeName: emp.name,
                    position: emp.position,
                    paymentDate: paymentDate.toISOString(),
                    period: `${paymentDate.toLocaleString('fr-FR', { month: 'long' })} ${year}`,
                    baseSalary: emp.baseSalary,
                    bonus: bonus,
                    total: emp.baseSalary + bonus,
                    status: 'payé',
                    paymentMethod: 'virement',
                    notes: ''
                });
            });
        }
        
        localStorage.setItem(PAYMENTS_KEY, JSON.stringify(payments));
    }
}

function initTeam() {
    const stored = localStorage.getItem(TEAM_KEY);
    if (stored) {
        team = JSON.parse(stored);
    } else {
        localStorage.setItem(TEAM_KEY, JSON.stringify(team));
    }
}

function initStockMovements() {
    const stored = localStorage.getItem(STOCK_MOVEMENTS_KEY);
    if (stored) {
        stockMovements = JSON.parse(stored);
    } else {
        localStorage.setItem(STOCK_MOVEMENTS_KEY, JSON.stringify(stockMovements));
    }
}

function initSettings() {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (stored) {
        settings = JSON.parse(stored);
    }
}

function updateClientsFromDevisAndInvoices() {
    const clientMap = new Map();
    
    clients.forEach(client => {
        clientMap.set(client.phone, client);
    });
    
    devis.forEach(d => {
        const key = d.customerInfo.phone;
        if (!clientMap.has(key)) {
            clientMap.set(key, {
                name: d.customerInfo.name,
                phone: d.customerInfo.phone,
                email: d.customerInfo.email || '',
                address: '',
                devisCount: 0,
                invoicesCount: 0,
                totalSpent: 0,
                lastActivity: d.date
            });
        }
        
        const client = clientMap.get(key);
        client.devisCount = (client.devisCount || 0) + 1;
        if (new Date(d.date) > new Date(client.lastActivity)) {
            client.lastActivity = d.date;
        }
    });
    
    invoices.forEach(inv => {
        const key = inv.phone;
        if (!clientMap.has(key)) {
            clientMap.set(key, {
                name: inv.client,
                phone: inv.phone,
                email: inv.email || '',
                address: '',
                devisCount: 0,
                invoicesCount: 0,
                totalSpent: 0,
                lastActivity: inv.date
            });
        }
        
        const client = clientMap.get(key);
        client.invoicesCount = (client.invoicesCount || 0) + 1;
        client.totalSpent = (client.totalSpent || 0) + inv.totalTTC;
        if (new Date(inv.date) > new Date(client.lastActivity)) {
            client.lastActivity = inv.date;
        }
    });
    
    clients = Array.from(clientMap.values());
    saveClients();
}

// ==================== FONCTIONS POUR LES STOCKS ====================
function addStockMovement(productId, type, quantity, reason, comment) {
    const product = products.find(p => p.id === productId);
    if (!product) return null;
    
    const oldStock = product.stock;
    let newStock = oldStock;
    
    if (type === 'entree') {
        newStock = oldStock + quantity;
        product.stock = newStock;
    } else if (type === 'sortie') {
        newStock = Math.max(0, oldStock - quantity);
        product.stock = newStock;
    } else if (type === 'ajustement') {
        newStock = quantity;
        quantity = newStock - oldStock;
        type = newStock > oldStock ? 'entree' : 'sortie';
    }
    
    const movement = {
        id: stockMovements.length + 1,
        date: new Date().toISOString(),
        productId: productId,
        productName: product.name,
        type: type,
        quantity: Math.abs(quantity),
        stockBefore: oldStock,
        stockAfter: newStock,
        reason: reason,
        comment: comment,
        user: 'Admin'
    };
    
    stockMovements.unshift(movement);
    
    if (stockMovements.length > 100) {
        stockMovements = stockMovements.slice(0, 100);
    }
    
    saveProducts();
    saveStockMovements();
    
    return movement;
}

// ==================== FONCTIONS FACTURES ====================
function generateInvoiceId() {
    const year = new Date().getFullYear();
    const count = invoices.length + 1;
    return `FACT-${year}-${String(count).padStart(3, '0')}`;
}

function addInvoice(event) {
    event.preventDefault();
    
    const clientSelect = document.getElementById('invoiceClient');
    const selectedClient = clients.find(c => c.phone === clientSelect.value);
    if (!selectedClient) {
        alert('Veuillez sélectionner un client');
        return;
    }
    
    const items = [];
    let totalHT = 0;
    let hasValidItems = false;
    
    document.querySelectorAll('.invoice-item').forEach(item => {
        const productSelect = item.querySelector('select[name="productId"]');
        const quantity = parseInt(item.querySelector('input[name="quantity"]').value);
        
        if (productSelect && productSelect.value && quantity > 0) {
            const product = products.find(p => p.id == productSelect.value);
            if (product) {
                items.push({
                    productId: product.id,
                    name: product.name,
                    quantity: quantity,
                    priceHT: product.priceHT
                });
                totalHT += product.priceHT * quantity;
                hasValidItems = true;
            }
        }
    });
    
    if (!hasValidItems) {
        alert('Veuillez ajouter au moins un article valide');
        return;
    }
    
    const tva = calculateTVA(totalHT);
    const totalTTC = calculateTTC(totalHT);
    
    const today = new Date().toISOString().split('T')[0];
    const dueDate = new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0];
    
    const invoiceDate = document.getElementById('invoiceDate').value || today;
    const invoiceDueDate = document.getElementById('invoiceDueDate').value || dueDate;
    
    const newInvoice = {
        id: generateInvoiceId(),
        client: selectedClient.name,
        phone: selectedClient.phone,
        email: selectedClient.email || '',
        date: invoiceDate,
        dueDate: invoiceDueDate,
        items: items,
        totalHT: totalHT,
        tva: tva,
        totalTTC: totalTTC,
        status: document.getElementById('invoicePaymentStatus').value,
        paymentMethod: document.getElementById('invoicePaymentMethod').value
    };
    
    invoices.push(newInvoice);
    saveInvoices();
    
    items.forEach(item => {
        addStockMovement(
            item.productId,
            'sortie',
            item.quantity,
            'facture',
            `Facture ${newInvoice.id}`
        );
    });
    
    const modal = bootstrap.Modal.getInstance(document.getElementById('addInvoiceModal'));
    if (modal) modal.hide();
    
    document.getElementById('addInvoiceForm').reset();
    
    showNotification('Facture créée', `La facture ${newInvoice.id} a été créée avec succès`);
}

function addInvoiceItem() {
    const container = document.getElementById('invoiceItems');
    
    let productOptions = '<option value="">Sélectionnez un produit</option>';
    products.forEach(p => {
        productOptions += `<option value="${p.id}" data-price="${p.priceHT}">${p.name} - ${p.priceHT.toLocaleString('fr-FR')} FCFA (Stock: ${p.stock})</option>`;
    });
    
    const newItem = document.createElement('div');
    newItem.className = 'row mb-3 invoice-item';
    newItem.innerHTML = `
        <div class="col-md-5">
            <select class="form-select" name="productId" required onchange="updateItemPrice(this)">
                ${productOptions}
            </select>
        </div>
        <div class="col-md-3">
            <input type="number" class="form-control" name="quantity" placeholder="Quantité" min="1" value="1" required>
        </div>
        <div class="col-md-3">
            <input type="text" class="form-control" name="price" placeholder="Prix HT" readonly>
        </div>
        <div class="col-md-1">
            <button type="button" class="action-btn delete" onclick="removeInvoiceItem(this)">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;
    
    container.appendChild(newItem);
}

function removeInvoiceItem(btn) {
    const items = document.querySelectorAll('.invoice-item');
    if (items.length > 1) {
        btn.closest('.invoice-item').remove();
    } else {
        alert('Vous devez garder au moins un article');
    }
}

function updateItemPrice(select) {
    const row = select.closest('.invoice-item');
    const priceInput = row.querySelector('input[name="price"]');
    const selected = select.options[select.selectedIndex];
    const price = selected.dataset.price;
    
    if (price) {
        priceInput.value = parseInt(price).toLocaleString('fr-FR') + ' FCFA';
    } else {
        priceInput.value = '';
    }
}

function generateInvoiceForOrder(invoiceId) {
    const invoice = invoices.find(i => i.id === invoiceId);
    if (!invoice) {
        showNotification('Erreur', 'Facture non trouvée', 'error');
        return;
    }
    
    currentInvoiceId = invoiceId;
    currentInvoiceData = invoice;
    
    const invoiceNumber = invoice.id;
    const orderNumber = `CMD-${String(invoices.indexOf(invoice) + 1).padStart(4, '0')}`;
    
    const itemsRows = invoice.items.map((item, index) => {
        const totalHT = item.quantity * item.priceHT;
        const tva = item.priceHT * TVA_RATE;
        const totalTTC = totalHT * (1 + TVA_RATE);
        
        return `
            <tr>
                <td>${index + 1}</td>
                <td>${item.name}</td>
                <td class="text-center">${item.quantity}</td>
                <td class="text-center">${Math.round(item.priceHT).toLocaleString('fr-FR')}</td>
                <td class="text-center">${Math.round(tva).toLocaleString('fr-FR')}</td>
                <td class="text-right">${Math.round(totalHT).toLocaleString('fr-FR')}</td>
                <td class="text-right">${Math.round(totalTTC).toLocaleString('fr-FR')}</td>
            </tr>
        `;
    }).join('');
    
    const invoiceHTML = `
        <div class="invoice-pdf-mobile">
            <div class="invoice-header-mobile">
                <div class="company-info-mobile">
                    <div class="company-logo-mobile">
                        <i class="fas fa-utensils"></i> ${settings.companyName}
                    </div>
                    <div class="company-contact-mobile">
                        <strong>Décoration d'événements</strong><br>
                        ${settings.companyAddress}<br>
                        <strong>Téléphone:</strong> ${settings.companyPhone}<br>
                        <strong>Email:</strong> ${settings.companyEmail}<br>
                        <strong>NIF:</strong> 1234567890
                    </div>
                </div>
                <div class="invoice-title-mobile">
                    <h1>FACTURE</h1>
                    <div class="invoice-number-mobile">
                        <strong>N°:</strong> ${invoiceNumber}
                    </div>
                    <div style="font-size: 11px;">
                        <strong>Date:</strong> ${new Date(invoice.date).toLocaleDateString('fr-FR')}<br>
                        <strong>Commande:</strong> ${orderNumber}
                    </div>
                </div>
            </div>
            
            <div class="invoice-details-mobile">
                <div class="client-info-mobile">
                    <div class="section-title-mobile">INFORMATIONS CLIENT</div>
                    <div style="font-size: 11px; line-height: 1.4;">
                        <strong>${invoice.client}</strong><br>
                        Tél: ${invoice.phone}<br>
                        ${invoice.email ? `Email: ${invoice.email}<br>` : ''}
                    </div>
                </div>
                
                <div class="order-info-mobile">
                    <div class="section-title-mobile">DÉTAILS FACTURE</div>
                    <div style="font-size: 11px; line-height: 1.4;">
                        <strong>Date d'échéance:</strong> ${new Date(invoice.dueDate || invoice.date).toLocaleDateString('fr-FR')}<br>
                        <strong>Statut:</strong> <span style="color: ${invoice.status === 'paid' ? '#28a745' : '#ffc107'};">${invoice.status === 'paid' ? 'Payée' : invoice.status === 'partial' ? 'Paiement partiel' : 'Impayée'}</span><br>
                        <strong>Paiement:</strong> ${invoice.paymentMethod || 'À déterminer'}
                    </div>
                </div>
            </div>
            
            <div class="section-title-mobile">ARTICLES FACTURÉS</div>
            <table class="invoice-table-mobile">
                <thead>
                    <tr>
                        <th>N°</th>
                        <th>ARTICLE</th>
                        <th class="text-center">QTÉ</th>
                        <th class="text-center">PRIX HT</th>
                        <th class="text-center">TVA 18%</th>
                        <th class="text-right">TOTAL HT</th>
                        <th class="text-right">TOTAL TTC</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsRows}
                </tbody>
            </table>
            
            <div class="totals-section-mobile">
                <div class="total-row-mobile">
                    <span><strong>Sous-total HT:</strong></span>
                    <span>${Math.round(invoice.totalHT).toLocaleString('fr-FR')} FCFA</span>
                </div>
                <div class="total-row-mobile">
                    <span><strong>TVA (18%):</strong></span>
                    <span>${Math.round(invoice.tva).toLocaleString('fr-FR')} FCFA</span>
                </div>
                <div class="total-row-mobile grand-total-mobile">
                    <span><strong>TOTAL TTC:</strong></span>
                    <span><strong>${Math.round(invoice.totalTTC).toLocaleString('fr-FR')} FCFA</strong></span>
                </div>
            </div>
            
            <div class="conditions-mobile">
                <strong>Conditions de paiement:</strong><br>
                • Paiement à réception de facture<br>
                • Accepté: Espèces, Wave, Orange Money, Free Money<br>
                • TVA 18% incluse<br>
                • Facture = Reçu officiel
            </div>
            
            <div class="stamp-mobile">
                <div style="font-size: 12px; font-weight: bold; color: var(--rouge-profond);">
                    <i class="fas fa-stamp"></i> ${invoice.status === 'paid' ? 'PAYÉ' : 'EN ATTENTE DE PAIEMENT'}
                </div>
                <div style="font-size: 10px; margin-top: 3px;">
                    ${new Date().toLocaleDateString('fr-FR')}
                </div>
                <div style="font-size: 9px; margin-top: 5px; color: #666;">
                    Signature & Cachet
                </div>
            </div>
            
            <div class="footer-mobile">
                <p style="margin: 0 0 5px 0; font-size: 10px; font-weight: bold;">
                    Merci pour votre confiance !
                </p>
                <p style="margin: 0;">
                    NJEEYGU - Le Grand Jour<br>
                    Tél: ${settings.companyPhone} | Email: ${settings.companyEmail}
                </p>
                <p style="margin: 5px 0 0 0; color: #999;">
                    Facture générée automatiquement • N° ${invoiceNumber}
                </p>
            </div>
        </div>
    `;
    
    document.getElementById('invoiceContent').innerHTML = invoiceHTML;
    document.getElementById('invoiceModalNumber').textContent = invoiceNumber;
    
    const modal = new bootstrap.Modal(document.getElementById('invoiceModal'));
    modal.show();
}

function downloadInvoicePDF() {
    if (!currentInvoiceData) {
        showNotification('Erreur', 'Aucune facture à télécharger', 'error');
        return;
    }
    
    showNotification('Génération du PDF en cours...', 'info');
    
    const invoiceElement = document.getElementById('invoiceContent');
    
    const originalStyles = {
        width: invoiceElement.style.width,
        maxWidth: invoiceElement.style.maxWidth,
        margin: invoiceElement.style.margin,
        padding: invoiceElement.style.padding,
        fontSize: invoiceElement.style.fontSize,
        lineHeight: invoiceElement.style.lineHeight
    };
    
    invoiceElement.style.width = '800px';
    invoiceElement.style.maxWidth = '800px';
    invoiceElement.style.margin = '0 auto';
    invoiceElement.style.padding = '20px';
    invoiceElement.style.fontSize = '12px';
    invoiceElement.style.lineHeight = '1.4';
    invoiceElement.style.backgroundColor = '#ffffff';
    
    html2canvas(invoiceElement, {
        scale: 3,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        letterRendering: true,
        allowTaint: true,
        width: 800,
        windowWidth: 800,
        onclone: function(clonedDoc) {
            const clonedElement = clonedDoc.getElementById('invoiceContent');
            if (clonedElement) {
                clonedElement.style.width = '800px';
                clonedElement.style.maxWidth = '800px';
                clonedElement.style.boxSizing = 'border-box';
                clonedElement.style.fontSize = '12px';
                clonedElement.style.lineHeight = '1.4';
                clonedElement.style.fontFamily = 'Montserrat, sans-serif';
            }
        }
    }).then(canvas => {
        invoiceElement.style.width = originalStyles.width;
        invoiceElement.style.maxWidth = originalStyles.maxWidth;
        invoiceElement.style.margin = originalStyles.margin;
        invoiceElement.style.padding = originalStyles.padding;
        invoiceElement.style.fontSize = originalStyles.fontSize;
        invoiceElement.style.lineHeight = originalStyles.lineHeight;
        
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jspdf.jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });
        
        const imgWidth = 190;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
        
        pdf.save(`Facture-${currentInvoiceData.id}.pdf`);
        
        showNotification('PDF téléchargé avec succès!', 'success');
    }).catch(error => {
        console.error('Erreur lors de la génération du PDF:', error);
        showNotification('Erreur lors de la génération du PDF', 'error');
        
        invoiceElement.style.width = originalStyles.width;
        invoiceElement.style.maxWidth = originalStyles.maxWidth;
        invoiceElement.style.margin = originalStyles.margin;
        invoiceElement.style.padding = originalStyles.padding;
        invoiceElement.style.fontSize = originalStyles.fontSize;
        invoiceElement.style.lineHeight = originalStyles.lineHeight;
    });
}

function printInvoice() {
    if (!currentInvoiceData) {
        showNotification('Erreur', 'Aucune facture à imprimer', 'error');
        return;
    }
    
    const printWindow = window.open('', '_blank');
    const invoiceContent = document.getElementById('invoiceContent').innerHTML;
    
    printWindow.document.write(`
        <!DOCTYPE html>
        <html lang="fr">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Facture ${currentInvoiceData.id}</title>
            <style>
                body {
                    font-family: 'Montserrat', Arial, sans-serif;
                    margin: 0;
                    padding: 20px;
                    color: #000;
                    font-size: 12px;
                    line-height: 1.4;
                }
                
                .invoice-pdf-mobile {
                    width: 100%;
                    max-width: 800px;
                    margin: 0 auto;
                    padding: 20px;
                    background: white;
                }
                
                .invoice-header-mobile {
                    display: flex;
                    flex-direction: column;
                    gap: 15px;
                    margin-bottom: 20px;
                    padding-bottom: 15px;
                    border-bottom: 2px solid #D4AF37;
                }
                
                .company-logo-mobile {
                    font-size: 18px;
                    font-weight: bold;
                    color: #8B0000;
                    margin-bottom: 8px;
                }
                
                .invoice-title-mobile h1 {
                    font-size: 22px;
                    font-weight: bold;
                    color: #8B0000;
                    margin: 0 0 10px 0;
                }
                
                .invoice-table-mobile {
                    width: 100%;
                    border-collapse: collapse;
                    margin: 15px 0;
                    font-size: 10px;
                }
                
                .invoice-table-mobile th {
                    background: #8B0000;
                    color: white;
                    padding: 8px 6px;
                    text-align: left;
                    font-weight: bold;
                }
                
                .invoice-table-mobile td {
                    padding: 6px;
                    border-bottom: 1px solid #ddd;
                }
                
                .text-right {
                    text-align: right;
                }
                
                .text-center {
                    text-align: center;
                }
                
                .stamp-mobile {
                    text-align: center;
                    margin: 20px auto;
                    padding: 15px 25px;
                    border: 2px solid #D4AF37;
                    border-radius: 3px;
                    display: inline-block;
                    transform: rotate(-5deg);
                    background: rgba(212, 175, 55, 0.05);
                }
                
                @media print {
                    body {
                        padding: 0;
                    }
                    .invoice-pdf-mobile {
                        padding: 10mm !important;
                        margin: 0 !important;
                        max-width: 100% !important;
                    }
                    .stamp-mobile {
                        transform: rotate(-5deg) !important;
                    }
                }
            </style>
        </head>
        <body>
            ${invoiceContent}
            <script>
                window.onload = function() {
                    window.print();
                    setTimeout(function() {
                        window.close();
                    }, 1000);
                };
            <\/script>
        </body>
        </html>
    `);
    
    printWindow.document.close();
}

function viewInvoiceDetails(invoiceId) {
    const invoice = invoices.find(i => i.id === invoiceId);
    if (!invoice) {
        console.error('Facture non trouvée:', invoiceId);
        showNotification('Erreur', 'Facture non trouvée', 'error');
        return;
    }
    
    generateInvoiceForOrder(invoiceId);
}

function deleteInvoice(invoiceId) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette facture ?')) {
        invoices = invoices.filter(i => i.id !== invoiceId);
        saveInvoices();
        showNotification('Facture supprimée', 'La facture a été supprimée avec succès');
    }
}

function filterInvoices(filter, event) {
    document.querySelectorAll('#section-factures .admin-tab').forEach(t => t.classList.remove('active'));
    event.target.classList.add('active');
    
    const tbody = document.getElementById('invoicesList');
    if (!tbody) return;
    
    let filteredInvoices = invoices;
    if (filter === 'paid') {
        filteredInvoices = invoices.filter(i => i.status === 'paid');
    } else if (filter === 'unpaid') {
        filteredInvoices = invoices.filter(i => i.status === 'unpaid' || i.status === 'partial');
    }
    
    filteredInvoices.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    tbody.innerHTML = '';
    filteredInvoices.forEach(invoice => {
        const statusClass = invoice.status === 'paid' ? 'badge-paid' : invoice.status === 'partial' ? 'badge-pending' : 'badge-unpaid';
        const statusLabel = invoice.status === 'paid' ? 'Payée' : invoice.status === 'partial' ? 'Partielle' : 'Impayée';
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${invoice.id}</strong></td>
            <td>${invoice.client}</td>
            <td>${invoice.phone}</td>
            <td>${invoice.email || '-'}</td>
            <td>${Math.round(invoice.totalHT).toLocaleString('fr-FR')} FCFA</td>
            <td>${Math.round(invoice.tva).toLocaleString('fr-FR')} FCFA</td>
            <td><strong>${Math.round(invoice.totalTTC).toLocaleString('fr-FR')} FCFA</strong></td>
            <td>${formatDate(invoice.date)}</td>
            <td><span class="badge-status ${statusClass}">${statusLabel}</span></td>
            <td>
                <button class="action-btn" onclick="viewInvoiceDetails('${invoice.id}')" title="Voir"><i class="fas fa-eye"></i></button>
                <button class="action-btn pdf" onclick="generateInvoiceForOrder('${invoice.id}')" title="PDF"><i class="fas fa-download"></i></button>
                <button class="action-btn delete" onclick="deleteInvoice('${invoice.id}')" title="Supprimer"><i class="fas fa-trash"></i></button>
            </td>
        `;
        tbody.appendChild(row);
    });
    
    if ($.fn.DataTable.isDataTable('#invoicesTable')) {
        $('#invoicesTable').DataTable().destroy();
    }
    
    $('#invoicesTable').DataTable({
        pageLength: 10,
        order: [[7, 'desc']],
        language: {
            url: '//cdn.datatables.net/plug-ins/1.13.6/i18n/fr-FR.json'
        }
    });
}

function showAddInvoiceModal() {
    const clientSelect = document.getElementById('invoiceClient');
    clientSelect.innerHTML = '<option value="">Sélectionnez un client</option>';
    
    clients.forEach(client => {
        clientSelect.innerHTML += `<option value="${client.phone}">${client.name} - ${client.phone}</option>`;
    });
    
    const firstProductSelect = document.querySelector('.invoice-item select[name="productId"]');
    if (firstProductSelect) {
        let productOptions = '<option value="">Sélectionnez un produit</option>';
        products.forEach(p => {
            productOptions += `<option value="${p.id}" data-price="${p.priceHT}">${p.name} - ${p.priceHT.toLocaleString('fr-FR')} FCFA (Stock: ${p.stock})</option>`;
        });
        firstProductSelect.innerHTML = productOptions;
    }
    
    const today = new Date().toISOString().split('T')[0];
    const dueDate = new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0];
    document.getElementById('invoiceDate').value = today;
    document.getElementById('invoiceDueDate').value = dueDate;
    
    document.getElementById('invoicePhone').value = '';
    document.getElementById('invoiceEmail').value = '';
    document.getElementById('invoicePaymentStatus').value = 'unpaid';
    document.getElementById('invoicePaymentMethod').value = 'especes';
    
    const modal = new bootstrap.Modal(document.getElementById('addInvoiceModal'));
    modal.show();
}

function updateClientInfo() {
    const clientSelect = document.getElementById('invoiceClient');
    const selectedClient = clients.find(c => c.phone === clientSelect.value);
    
    if (selectedClient) {
        document.getElementById('invoicePhone').value = selectedClient.phone;
        document.getElementById('invoiceEmail').value = selectedClient.email || '';
    } else {
        document.getElementById('invoicePhone').value = '';
        document.getElementById('invoiceEmail').value = '';
    }
}

function updateInvoiceStats() {
    const totalInvoices = invoices.length;
    const paidInvoices = invoices.filter(i => i.status === 'paid').length;
    const unpaidInvoices = invoices.filter(i => i.status === 'unpaid' || i.status === 'partial').length;
    const totalAmount = invoices.reduce((sum, i) => sum + i.totalTTC, 0);
    
    document.getElementById('statTotalInvoices').innerText = totalInvoices;
    document.getElementById('statPaidInvoices').innerText = paidInvoices;
    document.getElementById('statUnpaidInvoices').innerText = unpaidInvoices;
    document.getElementById('statTotalAmount').innerText = Math.round(totalAmount).toLocaleString('fr-FR') + ' FCFA';
    document.getElementById('invoicesCountAll').innerText = totalInvoices;
    document.getElementById('invoicesCountPaid').innerText = paidInvoices;
    document.getElementById('invoicesCountUnpaid').innerText = unpaidInvoices;
    document.getElementById('statFactures').innerText = totalInvoices;
}

function updateInvoicesTable() {
    const tbody = document.getElementById('invoicesList');
    if (!tbody) return;
    
    const sortedInvoices = [...invoices].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    tbody.innerHTML = '';
    sortedInvoices.forEach(invoice => {
        const statusClass = invoice.status === 'paid' ? 'badge-paid' : invoice.status === 'partial' ? 'badge-pending' : 'badge-unpaid';
        const statusLabel = invoice.status === 'paid' ? 'Payée' : invoice.status === 'partial' ? 'Partielle' : 'Impayée';
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${invoice.id}</strong></td>
            <td>${invoice.client}</td>
            <td>${invoice.phone}</td>
            <td>${invoice.email || '-'}</td>
            <td>${Math.round(invoice.totalHT).toLocaleString('fr-FR')} FCFA</td>
            <td>${Math.round(invoice.tva).toLocaleString('fr-FR')} FCFA</td>
            <td><strong>${Math.round(invoice.totalTTC).toLocaleString('fr-FR')} FCFA</strong></td>
            <td>${formatDate(invoice.date)}</td>
            <td><span class="badge-status ${statusClass}">${statusLabel}</span></td>
            <td>
                <button class="action-btn" onclick="viewInvoiceDetails('${invoice.id}')" title="Voir"><i class="fas fa-eye"></i></button>
                <button class="action-btn pdf" onclick="generateInvoiceForOrder('${invoice.id}')" title="PDF"><i class="fas fa-download"></i></button>
                <button class="action-btn delete" onclick="deleteInvoice('${invoice.id}')" title="Supprimer"><i class="fas fa-trash"></i></button>
            </td>
        `;
        tbody.appendChild(row);
    });
    
    if ($.fn.DataTable.isDataTable('#invoicesTable')) {
        $('#invoicesTable').DataTable().destroy();
    }
    
    $('#invoicesTable').DataTable({
        pageLength: 10,
        order: [[7, 'desc']],
        language: {
            url: '//cdn.datatables.net/plug-ins/1.13.6/i18n/fr-FR.json'
        }
    });
    
    updateInvoiceStats();
}

function updateRecentInvoices() {
    const tbody = document.getElementById('recentInvoicesList');
    if (!tbody) return;
    
    const recentInvoices = [...invoices].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
    
    tbody.innerHTML = '';
    recentInvoices.forEach(invoice => {
        const statusClass = invoice.status === 'paid' ? 'badge-paid' : invoice.status === 'partial' ? 'badge-pending' : 'badge-unpaid';
        const statusLabel = invoice.status === 'paid' ? 'Payée' : invoice.status === 'partial' ? 'Partielle' : 'Impayée';
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${invoice.id}</strong></td>
            <td>${invoice.client}</td>
            <td>${Math.round(invoice.totalTTC).toLocaleString('fr-FR')} FCFA</td>
            <td>${formatDate(invoice.date)}</td>
            <td><span class="badge-status ${statusClass}">${statusLabel}</span></td>
            <td>
                <button class="action-btn" onclick="viewInvoiceDetails('${invoice.id}')"><i class="fas fa-eye"></i></button>
                <button class="action-btn pdf" onclick="generateInvoiceForOrder('${invoice.id}')"><i class="fas fa-download"></i></button>
            </td>
        `;
        tbody.appendChild(row);
    });
    
    if ($.fn.DataTable.isDataTable('#recentInvoicesTable')) {
        $('#recentInvoicesTable').DataTable().destroy();
    }
    
    $('#recentInvoicesTable').DataTable({
        pageLength: 5,
        order: [[3, 'desc']],
        searching: false,
        language: {
            url: '//cdn.datatables.net/plug-ins/1.13.6/i18n/fr-FR.json'
        }
    });
}

function generateInvoiceReport() {
    const paidInvoices = invoices.filter(i => i.status === 'paid').length;
    const unpaidInvoices = invoices.filter(i => i.status === 'unpaid' || i.status === 'partial').length;
    const totalHT = invoices.reduce((sum, i) => sum + i.totalHT, 0);
    const totalTVA = invoices.reduce((sum, i) => sum + i.tva, 0);
    const totalTTC = invoices.reduce((sum, i) => sum + i.totalTTC, 0);
    
    alert(`
        RAPPORT DES FACTURES
        ====================
        
        Date: ${new Date().toLocaleDateString('fr-FR')}
        
        Total factures: ${invoices.length}
        Factures payées: ${paidInvoices}
        Factures impayées: ${unpaidInvoices}
        
        Montants:
        - Total HT: ${Math.round(totalHT).toLocaleString('fr-FR')} FCFA
        - TVA 18%: ${Math.round(totalTVA).toLocaleString('fr-FR')} FCFA
        - Total TTC: ${Math.round(totalTTC).toLocaleString('fr-FR')} FCFA
    `);
}

// ==================== FONCTIONS POUR LES DEVIS ====================
function updateDevisTables() {
    const tbody = document.getElementById('devisList');
    if (!tbody) return;
    
    const sortedDevis = [...devis].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    tbody.innerHTML = '';
    sortedDevis.forEach(d => {
        const statusClass = getDevisStatusClass(d.status);
        const statusLabel = getDevisStatusLabel(d.status);
        const budget = d.customerInfo.budget ? parseInt(d.customerInfo.budget).toLocaleString('fr-FR') + ' FCFA' : 'Non spécifié';
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${d.id}</strong></td>
            <td>${formatDate(d.date)}</td>
            <td>${d.customerInfo.name}</td>
            <td>${d.customerInfo.phone}</td>
            <td>${d.customerInfo.email || '-'}</td>
            <td>${d.product.name}</td>
            <td>${d.customerInfo.quantity}</td>
            <td>${d.customerInfo.eventDate ? formatDate(d.customerInfo.eventDate) : '-'}</td>
            <td>${budget}</td>
            <td><span class="badge-status ${statusClass}">${statusLabel}</span></td>
            <td>
                <button class="action-btn" onclick="viewDevisDetails('${d.id}')" title="Voir détails"><i class="fas fa-eye"></i></button>
                <button class="action-btn whatsapp" onclick="contactDevisClient('${d.id}')" title="WhatsApp"><i class="fab fa-whatsapp"></i></button>
                <button class="action-btn invoice" onclick="convertDevisToInvoiceFromList('${d.id}')" title="Générer facture"><i class="fas fa-file-invoice-dollar"></i></button>
                <button class="action-btn delete" onclick="deleteDevis('${d.id}')" title="Supprimer"><i class="fas fa-trash"></i></button>
            </td>
        `;
        tbody.appendChild(row);
    });
    
    if ($.fn.DataTable.isDataTable('#devisTable')) {
        $('#devisTable').DataTable().destroy();
    }
    
    $('#devisTable').DataTable({
        pageLength: 10,
        order: [[1, 'desc']],
        language: {
            url: '//cdn.datatables.net/plug-ins/1.13.6/i18n/fr-FR.json'
        }
    });
    
    updateRecentDevisTable();
}

function updateRecentDevisTable() {
    const tbody = document.getElementById('recentDevisList');
    if (!tbody) return;
    
    const recentDevis = [...devis].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
    
    tbody.innerHTML = '';
    recentDevis.forEach(d => {
        const statusClass = getDevisStatusClass(d.status);
        const statusLabel = getDevisStatusLabel(d.status);
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${d.id}</strong></td>
            <td>${d.customerInfo.name}</td>
            <td>${d.product.name}</td>
            <td>${d.customerInfo.phone}</td>
            <td>${formatDate(d.date)}</td>
            <td><span class="badge-status ${statusClass}">${statusLabel}</span></td>
            <td>
                <button class="action-btn" onclick="viewDevisDetails('${d.id}')"><i class="fas fa-eye"></i></button>
                <button class="action-btn whatsapp" onclick="contactDevisClient('${d.id}')"><i class="fab fa-whatsapp"></i></button>
            </td>
        `;
        tbody.appendChild(row);
    });
    
    if ($.fn.DataTable.isDataTable('#recentDevisTable')) {
        $('#recentDevisTable').DataTable().destroy();
    }
    
    $('#recentDevisTable').DataTable({
        pageLength: 5,
        order: [[4, 'desc']],
        searching: false,
        language: {
            url: '//cdn.datatables.net/plug-ins/1.13.6/i18n/fr-FR.json'
        }
    });
}

function updateDevisStats() {
    const totalDevis = devis.length;
    const pendingDevis = devis.filter(d => d.status === 'pending').length;
    const sentDevis = devis.filter(d => d.status === 'sent').length;
    const convertedDevis = devis.filter(d => d.status === 'converted').length;
    const cancelledDevis = devis.filter(d => d.status === 'cancelled').length;
    const conversionRate = totalDevis > 0 ? Math.round((convertedDevis / totalDevis) * 100) : 0;
    
    document.getElementById('statTotalDevis').innerText = totalDevis;
    document.getElementById('statPendingDevis').innerText = pendingDevis;
    document.getElementById('statSentDevis').innerText = sentDevis;
    document.getElementById('statConversionRate').innerText = conversionRate;
    
    document.getElementById('devisCountAll').innerText = totalDevis;
    document.getElementById('devisCountPending').innerText = pendingDevis;
    document.getElementById('devisCountSent').innerText = sentDevis;
    document.getElementById('devisCountConverted').innerText = convertedDevis;
    document.getElementById('devisCountCancelled').innerText = cancelledDevis;
    
    document.getElementById('statDevis').innerText = totalDevis;
}

function getDevisStatusClass(status) {
    switch(status) {
        case 'pending': return 'badge-devis-pending';
        case 'sent': return 'badge-devis-sent';
        case 'converted': return 'badge-devis-converted';
        case 'cancelled': return 'badge-devis-cancelled';
        default: return 'badge-devis-pending';
    }
}

function getDevisStatusLabel(status) {
    switch(status) {
        case 'pending': return 'En attente';
        case 'sent': return 'Devis envoyé';
        case 'converted': return 'Convertie';
        case 'cancelled': return 'Annulée';
        default: return status;
    }
}

function viewDevisDetails(devisId) {
    const devisItem = devis.find(d => d.id === devisId);
    if (!devisItem) return;
    
    currentDevisId = devisId;
    
    document.getElementById('modalDevisId').innerText = devisItem.id;
    document.getElementById('modalDevisName').innerText = devisItem.customerInfo.name;
    document.getElementById('modalDevisPhone').innerText = devisItem.customerInfo.phone;
    document.getElementById('modalDevisEmail').innerText = devisItem.customerInfo.email || 'Non spécifié';
    document.getElementById('modalDevisDate').innerText = formatDate(devisItem.date);
    document.getElementById('modalDevisQuantity').innerText = devisItem.customerInfo.quantity;
    document.getElementById('modalDevisEventDate').innerText = devisItem.customerInfo.eventDate ? formatDate(devisItem.customerInfo.eventDate) : 'Non spécifiée';
    document.getElementById('modalDevisBudget').innerText = devisItem.customerInfo.budget ? parseInt(devisItem.customerInfo.budget).toLocaleString('fr-FR') + ' FCFA' : 'Non spécifié';
    document.getElementById('modalDevisMessage').innerText = devisItem.customerInfo.message || 'Aucun message';
    document.getElementById('modalDevisStatusSelect').value = devisItem.status || 'pending';
    document.getElementById('modalDevisNotes').value = devisItem.notes || '';
    
    const productDiv = document.getElementById('modalDevisProduct');
    const product = products.find(p => p.id === devisItem.product.id);
    productDiv.innerHTML = `
        <div class="d-flex align-items-center gap-3">
            <img src="${product ? product.image : 'https://images.unsplash.com/photo-1478146896981-b80fe463b330?w=200'}" style="width: 60px; height: 60px; border-radius: 10px; object-fit: cover;">
            <div>
                <h6 class="mb-1">${devisItem.product.name}</h6>
                <p class="small mb-0">Catégorie: ${getCategoryLabel(devisItem.product.category)} | Stock: ${product ? product.stock : 'N/A'}</p>
                <p class="small mb-0">Prix HT: ${product ? product.priceHT.toLocaleString('fr-FR') : 'N/A'} FCFA | TTC: ${product ? Math.round(product.priceTTC).toLocaleString('fr-FR') : 'N/A'} FCFA</p>
            </div>
        </div>
    `;
    
    new bootstrap.Modal(document.getElementById('devisDetailsModal')).show();
}

function updateDevisStatus(status) {
    if (!currentDevisId) return;
    const devisItem = devis.find(d => d.id === currentDevisId);
    if (devisItem) {
        devisItem.status = status;
        devisItem.notes = document.getElementById('modalDevisNotes').value;
        saveDevis();
        showNotification('Statut mis à jour', `La demande ${devisItem.id} est maintenant ${getDevisStatusLabel(status)}`);
    }
}

function deleteDevis(devisId) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette demande de devis ?')) {
        devis = devis.filter(d => d.id !== devisId);
        saveDevis();
        showNotification('Devis supprimé', 'La demande a été supprimée avec succès');
    }
}

function filterDevis(filter, event) {
    document.querySelectorAll('#section-devis .admin-tab').forEach(t => t.classList.remove('active'));
    event.target.classList.add('active');
    
    const tbody = document.getElementById('devisList');
    if (!tbody) return;
    
    let filteredDevis = devis;
    if (filter !== 'all') {
        filteredDevis = devis.filter(d => d.status === filter);
    }
    
    filteredDevis.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    tbody.innerHTML = '';
    filteredDevis.forEach(d => {
        const statusClass = getDevisStatusClass(d.status);
        const statusLabel = getDevisStatusLabel(d.status);
        const budget = d.customerInfo.budget ? parseInt(d.customerInfo.budget).toLocaleString('fr-FR') + ' FCFA' : 'Non spécifié';
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${d.id}</strong></td>
            <td>${formatDate(d.date)}</td>
            <td>${d.customerInfo.name}</td>
            <td>${d.customerInfo.phone}</td>
            <td>${d.customerInfo.email || '-'}</td>
            <td>${d.product.name}</td>
            <td>${d.customerInfo.quantity}</td>
            <td>${d.customerInfo.eventDate ? formatDate(d.customerInfo.eventDate) : '-'}</td>
            <td>${budget}</td>
            <td><span class="badge-status ${statusClass}">${statusLabel}</span></td>
            <td>
                <button class="action-btn" onclick="viewDevisDetails('${d.id}')" title="Voir détails"><i class="fas fa-eye"></i></button>
                <button class="action-btn whatsapp" onclick="contactDevisClient('${d.id}')" title="WhatsApp"><i class="fab fa-whatsapp"></i></button>
                <button class="action-btn invoice" onclick="convertDevisToInvoiceFromList('${d.id}')" title="Générer facture"><i class="fas fa-file-invoice-dollar"></i></button>
                <button class="action-btn delete" onclick="deleteDevis('${d.id}')" title="Supprimer"><i class="fas fa-trash"></i></button>
            </td>
        `;
        tbody.appendChild(row);
    });
    
    if ($.fn.DataTable.isDataTable('#devisTable')) {
        $('#devisTable').DataTable().destroy();
    }
    
    $('#devisTable').DataTable({
        pageLength: 10,
        order: [[1, 'desc']],
        language: {
            url: '//cdn.datatables.net/plug-ins/1.13.6/i18n/fr-FR.json'
        }
    });
}

function contactDevisClient(devisId) {
    const devisItem = devis.find(d => d.id === devisId);
    if (!devisItem) return;
    
    const phone = devisItem.customerInfo.phone.replace(/\s/g, '');
    const product = devisItem.product.name;
    const quantity = devisItem.customerInfo.quantity;
    
    let message = `Bonjour ${devisItem.customerInfo.name}, je vous contacte de NJEEYGU suite à votre demande de devis pour ${product} (quantité: ${quantity}).`;
    
    if (devisItem.status === 'pending') {
        message += "\n\nNous avons bien reçu votre demande et nous vous préparons un devis personnalisé. Nous revenons vers vous très rapidement.";
    } else if (devisItem.status === 'sent') {
        message += "\n\nAvez-vous eu l'occasion de consulter le devis que nous vous avons envoyé ? N'hésitez pas si vous avez des questions.";
    }
    
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
}

function sendDevisQuote() {
    if (!currentDevisId) return;
    const devisItem = devis.find(d => d.id === currentDevisId);
    if (!devisItem) return;
    
    devisItem.status = 'sent';
    devisItem.notes = document.getElementById('modalDevisNotes').value;
    saveDevis();
    
    const product = products.find(p => p.id === devisItem.product.id);
    const phone = devisItem.customerInfo.phone.replace(/\s/g, '');
    
    const totalHT = product.priceHT * devisItem.customerInfo.quantity;
    const tva = calculateTVA(totalHT);
    const totalTTC = calculateTTC(totalHT);
    
    let message = `*NJEEYGU - DEVIS PERSONNALISÉ*\n\n`;
    message += `Bonjour ${devisItem.customerInfo.name},\n\n`;
    message += `Suite à votre demande, nous avons le plaisir de vous faire parvenir notre devis pour :\n`;
    message += `- Produit : ${product.name}\n`;
    message += `- Quantité : ${devisItem.customerInfo.quantity}\n\n`;
    message += `*Prix unitaire* : ${product.priceHT.toLocaleString('fr-FR')} FCFA HT\n`;
    message += `*Total HT* : ${totalHT.toLocaleString('fr-FR')} FCFA\n`;
    message += `*TVA 18%* : ${Math.round(tva).toLocaleString('fr-FR')} FCFA\n`;
    message += `*Total TTC* : ${Math.round(totalTTC).toLocaleString('fr-FR')} FCFA\n\n`;
    message += `*Délai de livraison* : À déterminer\n`;
    message += `*Validité du devis* : 30 jours\n\n`;
    message += `N'hésitez pas à nous contacter pour toute question ou pour confirmer votre commande.\n\n`;
    message += `Cordialement,\nL'équipe NJEEYGU`;
    
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
    
    bootstrap.Modal.getInstance(document.getElementById('devisDetailsModal')).hide();
    showNotification('Devis envoyé', `Le devis a été envoyé à ${devisItem.customerInfo.name}`);
}

function convertDevisToInvoice() {
    if (!currentDevisId) return;
    const devisItem = devis.find(d => d.id === currentDevisId);
    if (!devisItem) return;
    
    convertDevisToInvoiceInternal(devisItem);
    bootstrap.Modal.getInstance(document.getElementById('devisDetailsModal')).hide();
}

function convertDevisToInvoiceFromList(devisId) {
    const devisItem = devis.find(d => d.id === devisId);
    if (!devisItem) return;
    
    convertDevisToInvoiceInternal(devisItem);
}

function convertDevisToInvoiceInternal(devisItem) {
    const product = products.find(p => p.id === devisItem.product.id);
    if (!product) {
        alert('Produit non trouvé dans la base');
        return;
    }
    
    const quantity = parseInt(devisItem.customerInfo.quantity) || 1;
    const totalHT = product.priceHT * quantity;
    const tva = calculateTVA(totalHT);
    const totalTTC = calculateTTC(totalHT);
    
    const invoiceId = generateInvoiceId();
    
    const today = new Date().toISOString().split('T')[0];
    const dueDate = new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0];
    
    const newInvoice = {
        id: invoiceId,
        client: devisItem.customerInfo.name,
        phone: devisItem.customerInfo.phone,
        email: devisItem.customerInfo.email || '',
        date: today,
        dueDate: dueDate,
        items: [{
            productId: product.id,
            name: product.name,
            quantity: quantity,
            priceHT: product.priceHT
        }],
        totalHT: totalHT,
        tva: tva,
        totalTTC: totalTTC,
        status: 'unpaid',
        paymentMethod: 'non spécifié'
    };
    
    invoices.push(newInvoice);
    saveInvoices();
    
    addStockMovement(
        product.id,
        'sortie',
        quantity,
        'facture',
        `Facture ${invoiceId}`
    );
    
    devisItem.status = 'converted';
    devisItem.notes = (devisItem.notes || '') + `\nConvertie en facture ${invoiceId} le ${new Date().toLocaleDateString('fr-FR')}`;
    saveDevis();
    
    showNotification('Facture créée', `La facture ${invoiceId} a été créée avec succès`);
}

function exportDevis() {
    const data = devis.map(d => ({
        'Référence': d.id,
        'Date': formatDate(d.date),
        'Client': d.customerInfo.name,
        'Téléphone': d.customerInfo.phone,
        'Email': d.customerInfo.email || '',
        'Produit': d.product.name,
        'Quantité': d.customerInfo.quantity,
        'Date événement': d.customerInfo.eventDate ? formatDate(d.customerInfo.eventDate) : '',
        'Budget': d.customerInfo.budget || '',
        'Statut': getDevisStatusLabel(d.status)
    }));
    
    const csv = convertToCSV(data);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `demandes_devis_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    showNotification('Export réussi', 'Le fichier CSV a été généré');
}

function generateDevisReport() {
    const totalDevis = devis.length;
    const pendingCount = devis.filter(d => d.status === 'pending').length;
    const sentCount = devis.filter(d => d.status === 'sent').length;
    const convertedCount = devis.filter(d => d.status === 'converted').length;
    const conversionRate = totalDevis > 0 ? Math.round((convertedCount / totalDevis) * 100) : 0;
    
    const productCounts = {};
    devis.forEach(d => {
        const productName = d.product.name;
        productCounts[productName] = (productCounts[productName] || 0) + 1;
    });
    
    let topProducts = Object.entries(productCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, count]) => `- ${name}: ${count} demandes`)
        .join('\n');
    
    const report = `
        RAPPORT DES DEMANDES DE DEVIS
        =============================
        
        Date: ${new Date().toLocaleDateString('fr-FR')}
        
        RÉCAPITULATIF:
        - Total demandes: ${totalDevis}
        - En attente: ${pendingCount}
        - Devis envoyés: ${sentCount}
        - Converties en facture: ${convertedCount}
        - Annulées: ${devis.filter(d => d.status === 'cancelled').length}
        
        PERFORMANCE:
        - Taux de conversion: ${conversionRate}%
        
        PRODUITS LES PLUS DEMANDÉS:
${topProducts || 'Aucune donnée'}
        
        ÉVOLUTION MENSUELLE:
        ${getMonthlyDevisBreakdown()}
    `;
    
    alert(report);
}

function getMonthlyDevisBreakdown() {
    const months = {};
    devis.forEach(d => {
        const date = new Date(d.date);
        const key = `${date.getMonth()+1}/${date.getFullYear()}`;
        months[key] = (months[key] || 0) + 1;
    });
    
    return Object.entries(months)
        .sort((a, b) => {
            const [mA, yA] = a[0].split('/');
            const [mB, yB] = b[0].split('/');
            return new Date(yA, mA-1) - new Date(yB, mB-1);
        })
        .map(([month, count]) => `- ${month}: ${count} demandes`)
        .join('\n');
}

// ==================== FONCTIONS POUR LE STOCK ====================
function showAddStockModal() {
    document.getElementById('stockModalProductName').innerText = 'Nouveau produit';
    document.getElementById('stockModalProductId').value = '';
    document.getElementById('stockModalCurrentStock').value = '0';
    document.getElementById('stockModalMinStock').value = settings.defaultStockAlert.toString();
    document.getElementById('stockModalQuantity').value = '1';
    document.getElementById('stockModalNewValue').value = '0';
    document.getElementById('stockModalComment').value = '';
    document.getElementById('stockModalOperation').value = 'add';
    
    toggleStockOperationFields();
    
    document.querySelector('#stockManagementModal .modal-title').innerHTML = 'Ajouter un nouveau stock';
    
    new bootstrap.Modal(document.getElementById('stockManagementModal')).show();
}

function addNewStock() {
    const productName = document.getElementById('stockModalProductName').innerText === 'Nouveau produit' ? prompt('Nom du nouveau produit :') : null;
    if (!productName) return;
    
    const category = prompt('Catégorie (table/lumiere/mariage/ballon/deco) :', 'deco');
    if (!category || !['table', 'lumiere', 'mariage', 'ballon', 'deco'].includes(category)) {
        alert('Catégorie invalide');
        return;
    }
    
    const priceHT = parseInt(prompt('Prix HT (FCFA) :', '10000'));
    if (isNaN(priceHT) || priceHT <= 0) return;
    
    const stock = parseInt(document.getElementById('stockModalQuantity').value) || 10;
    
    const minStock = parseInt(document.getElementById('stockModalMinStock').value) || settings.defaultStockAlert;
    
    const location = prompt('Emplacement (ex: A1-R2) :', 'Nouveau') || 'Nouveau';
    
    const defaultImage = 'https://images.unsplash.com/photo-1478146896981-b80fe463b330?w=200';
    
    const newProduct = {
        id: products.length + 1,
        name: productName,
        category: category,
        priceHT: priceHT,
        priceTTC: calculateTTC(priceHT),
        stock: stock,
        minStock: minStock,
        status: 'active',
        image: defaultImage,
        location: location
    };
    
    products.push(newProduct);
    saveProducts();
    
    addStockMovement(
        newProduct.id,
        'entree',
        stock,
        'reception',
        'Nouveau produit ajouté'
    );
    
    bootstrap.Modal.getInstance(document.getElementById('stockManagementModal')).hide();
    showNotification('Produit ajouté', `${newProduct.name} a été ajouté au stock avec succès`);
}

function toggleStockOperationFields() {
    const operation = document.getElementById('stockModalOperation').value;
    const quantityGroup = document.getElementById('stockModalQuantityGroup');
    const newValueGroup = document.getElementById('stockModalNewValueGroup');
    
    if (operation === 'set') {
        quantityGroup.style.display = 'none';
        newValueGroup.style.display = 'block';
    } else {
        quantityGroup.style.display = 'block';
        newValueGroup.style.display = 'none';
    }
}

function openStockModal(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    currentStockProductId = productId;
    document.getElementById('stockModalProductName').innerText = product.name;
    document.getElementById('stockModalProductId').value = productId;
    document.getElementById('stockModalCurrentStock').value = product.stock;
    document.getElementById('stockModalMinStock').value = product.minStock || settings.defaultStockAlert;
    document.getElementById('stockModalQuantity').value = 1;
    document.getElementById('stockModalNewValue').value = product.stock;
    document.getElementById('stockModalComment').value = '';
    document.getElementById('stockModalOperation').value = 'add';
    
    toggleStockOperationFields();
    
    document.querySelector('#stockManagementModal .modal-title').innerHTML = 'Gérer le stock - ' + product.name;
    
    new bootstrap.Modal(document.getElementById('stockManagementModal')).show();
}

function updateStock() {
    const productId = document.getElementById('stockModalProductId').value;
    const operation = document.getElementById('stockModalOperation').value;
    const reason = document.getElementById('stockModalReason').value;
    const comment = document.getElementById('stockModalComment').value;
    
    if (!productId) {
        addNewStock();
        return;
    }
    
    const product = products.find(p => p.id == productId);
    if (!product) return;
    
    const oldStock = product.stock;
    let newStock = oldStock;
    let quantity = 0;
    let type = 'ajustement';
    
    if (operation === 'add') {
        quantity = parseInt(document.getElementById('stockModalQuantity').value) || 0;
        newStock = oldStock + quantity;
        type = 'entree';
    } else if (operation === 'remove') {
        quantity = parseInt(document.getElementById('stockModalQuantity').value) || 0;
        newStock = Math.max(0, oldStock - quantity);
        type = 'sortie';
    } else if (operation === 'set') {
        newStock = parseInt(document.getElementById('stockModalNewValue').value) || 0;
        quantity = Math.abs(newStock - oldStock);
        type = newStock > oldStock ? 'entree' : 'sortie';
    }
    
    const minStock = parseInt(document.getElementById('stockModalMinStock').value) || settings.defaultStockAlert;
    product.minStock = minStock;
    
    addStockMovement(product.id, type, quantity, reason, comment);
    
    bootstrap.Modal.getInstance(document.getElementById('stockManagementModal')).hide();
    
    showNotification(
        'Stock mis à jour',
        `${product.name}: ${oldStock} → ${newStock} unités`
    );
}

function deleteProduct(productId) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
        const product = products.find(p => p.id === productId);
        products = products.filter(p => p.id !== productId);
        saveProducts();
        showNotification('Produit supprimé', `${product.name} a été supprimé avec succès`);
    }
}

function quickAddStock(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const quantity = prompt(`Ajouter au stock pour ${product.name}:`, "1");
    if (quantity && !isNaN(quantity) && parseInt(quantity) > 0) {
        addStockMovement(
            productId,
            'entree',
            parseInt(quantity),
            'ajustement',
            'Ajout rapide'
        );
        
        showNotification(
            'Stock ajouté',
            `+${quantity} ${product.name}`
        );
    }
}

function quickOrderStock(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const quantity = product.minStock * 2 - product.stock;
    if (quantity > 0) {
        if (confirm(`Commander ${quantity} unités de ${product.name} ?`)) {
            addStockMovement(
                productId,
                'entree',
                quantity,
                'reception',
                'Commande fournisseur'
            );
            
            showNotification(
                'Commande passée',
                `${quantity} ${product.name} ajoutés au stock`
            );
        }
    } else {
        alert('Le stock est suffisant pour ce produit.');
    }
}

function showProductMovements(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const productMovements = stockMovements.filter(m => m.productId === productId);
    
    let message = `Mouvements pour ${product.name}:\n\n`;
    productMovements.slice(0, 10).forEach(m => {
        message += `${formatDate(m.date)} - ${m.type === 'entree' ? '+' : '-'}${m.quantity} (${m.reason}) - Stock: ${m.stockAfter}\n`;
    });
    
    if (productMovements.length === 0) {
        message += "Aucun mouvement enregistré.";
    }
    
    alert(message);
}

function showStockMovementModal() {
    const select = document.getElementById('movementProductId');
    select.innerHTML = '<option value="">Sélectionnez un produit</option>';
    products.forEach(product => {
        select.innerHTML += `<option value="${product.id}">${product.name} (Stock: ${product.stock})</option>`;
    });
    
    new bootstrap.Modal(document.getElementById('stockMovementModal')).show();
}

function addStockMovementFromModal() {
    const productId = parseInt(document.getElementById('movementProductId').value);
    const type = document.getElementById('movementType').value;
    const quantity = parseInt(document.getElementById('movementQuantity').value);
    const reason = document.getElementById('movementReason').value;
    const comment = document.getElementById('movementComment').value;
    
    if (!productId || quantity <= 0) {
        alert('Veuillez remplir tous les champs correctement.');
        return;
    }
    
    const movement = addStockMovement(productId, type, quantity, reason, comment);
    
    if (movement) {
        bootstrap.Modal.getInstance(document.getElementById('stockMovementModal')).hide();
        showNotification('Mouvement enregistré', `${quantity} unités ${type === 'entree' ? 'ajoutées' : 'retirées'}`);
    }
}

function showBulkStockModal() {
    alert('Fonctionnalité de mise à jour groupée à implémenter');
}

function exportStockReport() {
    const data = products.map(p => ({
        'Produit': p.name,
        'Catégorie': getCategoryLabel(p.category),
        'Prix HT': p.priceHT,
        'TVA 18%': calculateTVA(p.priceHT),
        'Prix TTC': p.priceTTC,
        'Stock actuel': p.stock,
        'Stock minimum': p.minStock,
        'Valeur stock TTC': p.stock * p.priceTTC,
        'Emplacement': p.location || 'Non défini'
    }));
    
    const csv = convertToCSV(data);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stock_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    showNotification('Export réussi', 'Le rapport de stock a été généré');
}

// ==================== MISES À JOUR UI ====================
function updateStats() {
    document.getElementById('statProduits').innerText = products.length;
    document.getElementById('statClients').innerText = clients.length;
    
    updateDevisStats();
    updateInvoiceStats();
}

function updateStockStats() {
    const totalStock = products.reduce((sum, p) => sum + p.stock, 0);
    const criticalStock = products.filter(p => p.stock <= p.minStock * 0.5).length;
    const lowStock = products.filter(p => p.stock > p.minStock * 0.5 && p.stock <= p.minStock).length;
    const mediumStock = products.filter(p => p.stock > p.minStock && p.stock <= p.minStock * 2).length;
    const highStock = products.filter(p => p.stock > p.minStock * 2).length;
    const totalValue = products.reduce((sum, p) => sum + (p.stock * p.priceTTC), 0);
    
    document.getElementById('statTotalStock').innerText = totalStock;
    document.getElementById('statCriticalStock').innerText = criticalStock;
    document.getElementById('statStockValue').innerText = totalValue.toLocaleString('fr-FR') + ' FCFA';
    document.getElementById('statMouvements').innerText = stockMovements.filter(m => 
        new Date(m.date) > new Date(Date.now() - 30 * 86400000)
    ).length;
    
    document.getElementById('stockCountAll').innerText = products.length;
    document.getElementById('stockCountCritical').innerText = criticalStock;
    document.getElementById('stockCountLow').innerText = lowStock;
    document.getElementById('stockCountMedium').innerText = mediumStock;
    document.getElementById('stockCountHigh').innerText = highStock;
}

function updateBadges() {
    const pendingDevis = devis.filter(d => d.status === 'pending').length;
    document.getElementById('devisPendingBadge').innerText = pendingDevis;
    
    const lowStock = products.filter(p => p.stock <= p.minStock).length;
    document.getElementById('lowStockBadge').innerText = lowStock;
    document.getElementById('stockAlertBadge').innerText = lowStock;
    
    if (lowStock > 0) {
        document.getElementById('lowStockAlert').style.display = 'block';
        document.getElementById('lowStockCount').innerText = lowStock;
    } else {
        document.getElementById('lowStockAlert').style.display = 'none';
    }
    
    const now = new Date();
    const pendingPayments = employees.filter(emp => {
        const paidThisMonth = payments.some(p => 
            p.employeeId === emp.id && 
            new Date(p.paymentDate).getMonth() === now.getMonth() &&
            new Date(p.paymentDate).getFullYear() === now.getFullYear()
        );
        return !paidThisMonth && emp.status === 'actif';
    }).length;
    
    document.getElementById('salariesBadge').innerText = pendingPayments;
}

function updateStockAlerts() {
    const lowStock = products.filter(p => p.stock <= p.minStock);
    if (lowStock.length > 0) {
        showNotification(
            'Alerte stock', 
            `${lowStock.length} produit(s) ont un stock faible ou critique`
        );
    }
}

function getStockStatus(stock, minStock) {
    if (stock <= 0) return { class: 'badge-stock-critical', label: 'Rupture' };
    if (stock <= minStock * 0.5) return { class: 'badge-stock-critical', label: 'Critique' };
    if (stock <= minStock) return { class: 'badge-stock-low', label: 'Faible' };
    if (stock <= minStock * 2) return { class: 'badge-stock-medium', label: 'Moyen' };
    return { class: 'badge-stock-high', label: 'Élevé' };
}

function getStockProgressClass(stock, minStock) {
    if (stock <= 0) return 'critical';
    if (stock <= minStock * 0.5) return 'critical';
    if (stock <= minStock) return 'low';
    if (stock <= minStock * 2) return 'medium';
    return 'high';
}

// ==================== TABLEAUX ====================
function updateProductsTable() {
    const tbody = document.getElementById('productsList');
    if (!tbody) return;
    
    document.getElementById('totalProducts').innerText = products.length;
    
    tbody.innerHTML = '';
    products.forEach(product => {
        const stockStatus = getStockStatus(product.stock, product.minStock);
        const progressClass = getStockProgressClass(product.stock, product.minStock);
        const stockPercentage = Math.min(100, (product.stock / (product.minStock * 3)) * 100);
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><img src="${product.image}" style="width: 40px; height: 40px; border-radius: 8px; object-fit: cover;"></td>
            <td><strong>${product.name}</strong></td>
            <td>${getCategoryLabel(product.category)}</td>
            <td>${product.priceHT.toLocaleString('fr-FR')} FCFA</td>
            <td>${Math.round(calculateTVA(product.priceHT)).toLocaleString('fr-FR')} FCFA</td>
            <td><strong>${Math.round(product.priceTTC).toLocaleString('fr-FR')} FCFA</strong></td>
            <td>
                <div>
                    <span class="${product.stock <= product.minStock ? 'text-danger fw-bold' : ''}">${product.stock}</span>
                    <small class="text-muted">/ min ${product.minStock}</small>
                    <div class="stock-progress">
                        <div class="stock-progress-bar ${progressClass}" style="width: ${stockPercentage}%"></div>
                    </div>
                </div>
            </td>
            <td><span class="badge-status ${product.status === 'active' ? 'badge-active' : 'badge-inactive'}">${product.status === 'active' ? 'Actif' : 'Inactif'}</span></td>
            <td>
                <button class="action-btn" onclick="editProduct(${product.id})"><i class="fas fa-edit"></i></button>
                <button class="action-btn add-stock" onclick="openStockModal(${product.id})"><i class="fas fa-boxes"></i></button>
                <button class="action-btn delete" onclick="deleteProduct(${product.id})"><i class="fas fa-trash"></i></button>
            </td>
        `;
        tbody.appendChild(row);
    });
    
    if ($.fn.DataTable.isDataTable('#productsTable')) {
        $('#productsTable').DataTable().destroy();
    }
    
    $('#productsTable').DataTable({
        pageLength: 10,
        language: {
            url: '//cdn.datatables.net/plug-ins/1.13.6/i18n/fr-FR.json'
        }
    });
}

function updateStockTable(filter = 'all') {
    const tbody = document.getElementById('stockList');
    if (!tbody) return;
    
    let filteredProducts = products;
    
    if (filter === 'critical') {
        filteredProducts = products.filter(p => p.stock <= p.minStock * 0.5);
    } else if (filter === 'low') {
        filteredProducts = products.filter(p => p.stock <= p.minStock && p.stock > p.minStock * 0.5);
    } else if (filter === 'medium') {
        filteredProducts = products.filter(p => p.stock > p.minStock && p.stock <= p.minStock * 2);
    } else if (filter === 'high') {
        filteredProducts = products.filter(p => p.stock > p.minStock * 2);
    }
    
    tbody.innerHTML = '';
    filteredProducts.forEach(product => {
        const stockStatus = getStockStatus(product.stock, product.minStock);
        const progressClass = getStockProgressClass(product.stock, product.minStock);
        const stockPercentage = Math.min(100, (product.stock / (product.minStock * 3)) * 100);
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><img src="${product.image}" style="width: 40px; height: 40px; border-radius: 8px; object-fit: cover;"></td>
            <td><strong>${product.name}</strong></td>
            <td>${getCategoryLabel(product.category)}</td>
            <td>${product.priceHT.toLocaleString('fr-FR')} FCFA</td>
            <td><strong>${Math.round(product.priceTTC).toLocaleString('fr-FR')} FCFA</strong></td>
            <td>
                <div>
                    <span class="fw-bold ${product.stock <= product.minStock ? 'text-danger' : ''}">${product.stock}</span>
                    <div class="stock-progress">
                        <div class="stock-progress-bar ${progressClass}" style="width: ${stockPercentage}%"></div>
                    </div>
                </div>
            </td>
            <td>${product.minStock}</td>
            <td><span class="badge-stock ${stockStatus.class}">${stockStatus.label}</span></td>
            <td>${product.location || 'Non défini'}</td>
            <td>
                <button class="action-btn" onclick="openStockModal(${product.id})"><i class="fas fa-edit"></i></button>
                <button class="action-btn add-stock" onclick="quickAddStock(${product.id})"><i class="fas fa-plus"></i></button>
                <button class="action-btn" onclick="showProductMovements(${product.id})"><i class="fas fa-history"></i></button>
                <button class="action-btn delete" onclick="deleteProduct(${product.id})"><i class="fas fa-trash"></i></button>
            </td>
        `;
        tbody.appendChild(row);
    });
    
    if ($.fn.DataTable.isDataTable('#stockTable')) {
        $('#stockTable').DataTable().destroy();
    }
    
    $('#stockTable').DataTable({
        pageLength: 10,
        order: [[5, 'asc']],
        language: {
            url: '//cdn.datatables.net/plug-ins/1.13.6/i18n/fr-FR.json'
        }
    });
    
    updateStockStats();
}

function updateStockMovementsTable() {
    const tbody = document.getElementById('stockMovementsList');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    stockMovements.slice(0, 10).forEach(movement => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${formatDate(movement.date)}</td>
            <td>${movement.productName}</td>
            <td>
                <span class="badge-status ${movement.type === 'entree' ? 'badge-active' : movement.type === 'sortie' ? 'badge-pending' : 'badge-status'}">
                    ${movement.type === 'entree' ? 'Entrée' : movement.type === 'sortie' ? 'Sortie' : 'Ajustement'}
                </span>
            </td>
            <td>${movement.quantity}</td>
            <td>${movement.stockAfter}</td>
            <td>${movement.reason}</td>
            <td>${movement.user}</td>
        `;
        tbody.appendChild(row);
    });
    
    if ($.fn.DataTable.isDataTable('#stockMovementsTable')) {
        $('#stockMovementsTable').DataTable().destroy();
    }
    
    $('#stockMovementsTable').DataTable({
        pageLength: 5,
        order: [[0, 'desc']],
        searching: false,
        language: {
            url: '//cdn.datatables.net/plug-ins/1.13.6/i18n/fr-FR.json'
        }
    });
}

function updateClientsTable() {
    const tbody = document.getElementById('clientsList');
    if (!tbody) return;
    
    const totalSpent = clients.reduce((sum, c) => sum + (c.totalSpent || 0), 0);
    
    document.getElementById('statTotalClients').innerText = clients.length;
    document.getElementById('statClientsWithDevis').innerText = clients.filter(c => c.devisCount > 0).length;
    document.getElementById('statClientsWithInvoices').innerText = clients.filter(c => c.invoicesCount > 0).length;
    document.getElementById('statTotalSpent').innerText = totalSpent.toLocaleString('fr-FR') + ' FCFA';
    
    tbody.innerHTML = '';
    clients.forEach(client => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${client.name}</strong></td>
            <td>${client.phone}</td>
            <td>${client.email || 'Non renseigné'}</td>
            <td>${client.devisCount || 0}</td>
            <td>${client.invoicesCount || 0}</td>
            <td>${client.totalSpent ? client.totalSpent.toLocaleString('fr-FR') : 0} FCFA</td>
            <td>${formatDate(client.lastActivity)}</td>
            <td>
                <button class="action-btn" onclick="contactClient('${client.phone}')"><i class="fab fa-whatsapp"></i></button>
                <button class="action-btn invoice" onclick="createInvoiceForClient('${client.phone}')"><i class="fas fa-file-invoice-dollar"></i></button>
                <button class="action-btn delete" onclick="deleteClient('${client.phone}')"><i class="fas fa-user-slash"></i></button>
            </td>
        `;
        tbody.appendChild(row);
    });
    
    if ($.fn.DataTable.isDataTable('#clientsTable')) {
        $('#clientsTable').DataTable().destroy();
    }
    
    $('#clientsTable').DataTable({
        pageLength: 10,
        language: {
            url: '//cdn.datatables.net/plug-ins/1.13.6/i18n/fr-FR.json'
        }
    });
}

function updateCategoriesTable() {
    const tbody = document.getElementById('categoriesList');
    if (!tbody) return;
    
    const categories = [
        { name: 'Art de la table', products: products.filter(p => p.category === 'table') },
        { name: 'Lumières', products: products.filter(p => p.category === 'lumiere') },
        { name: 'Mariage', products: products.filter(p => p.category === 'mariage') },
        { name: 'Ballons', products: products.filter(p => p.category === 'ballon') },
        { name: 'Décoration', products: products.filter(p => p.category === 'deco') }
    ];
    
    tbody.innerHTML = '';
    categories.forEach(cat => {
        const stockValue = cat.products.reduce((sum, p) => sum + (p.stock * p.priceTTC), 0);
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${cat.name}</strong></td>
            <td>${cat.products.length}</td>
            <td>${stockValue.toLocaleString('fr-FR')} FCFA</td>
            <td>
                <button class="action-btn"><i class="fas fa-edit"></i></button>
                <button class="action-btn delete"><i class="fas fa-trash"></i></button>
            </td>
        `;
        tbody.appendChild(row);
    });
    
    if ($.fn.DataTable.isDataTable('#categoriesTable')) {
        $('#categoriesTable').DataTable().destroy();
    }
    
    $('#categoriesTable').DataTable({
        pageLength: 10,
        searching: false,
        language: {
            url: '//cdn.datatables.net/plug-ins/1.13.6/i18n/fr-FR.json'
        }
    });
}

function updateServicesTable() {
    const tbody = document.getElementById('servicesList');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    services.forEach(service => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${service.name}</strong></td>
            <td>${service.description || ''}</td>
            <td>${service.priceHT.toLocaleString('fr-FR')} FCFA</td>
            <td>${Math.round(calculateTVA(service.priceHT)).toLocaleString('fr-FR')} FCFA</td>
            <td><strong>${Math.round(service.priceTTC).toLocaleString('fr-FR')} FCFA</strong></td>
            <td>
                <button class="action-btn" onclick="editService(${service.id})"><i class="fas fa-edit"></i></button>
                <button class="action-btn delete" onclick="deleteService(${service.id})"><i class="fas fa-trash"></i></button>
            </td>
        `;
        tbody.appendChild(row);
    });
    
    if ($.fn.DataTable.isDataTable('#servicesTable')) {
        $('#servicesTable').DataTable().destroy();
    }
    
    $('#servicesTable').DataTable({
        pageLength: 10,
        language: {
            url: '//cdn.datatables.net/plug-ins/1.13.6/i18n/fr-FR.json'
        }
    });
}

// ==================== FONCTIONS POUR LES CLIENTS ====================
function showAddClientModal() {
    document.getElementById('addClientForm').reset();
    new bootstrap.Modal(document.getElementById('addClientModal')).show();
}

function addClient(event) {
    event.preventDefault();
    
    const name = document.getElementById('clientName').value;
    const phone = document.getElementById('clientPhone').value;
    const email = document.getElementById('clientEmail').value;
    const address = document.getElementById('clientAddress').value;
    
    const existing = clients.find(c => c.phone === phone);
    if (existing) {
        alert('Un client avec ce numéro de téléphone existe déjà');
        return;
    }
    
    const newClient = {
        name: name,
        phone: phone,
        email: email,
        address: address,
        devisCount: 0,
        invoicesCount: 0,
        totalSpent: 0,
        lastActivity: new Date().toISOString()
    };
    
    clients.push(newClient);
    saveClients();
    
    bootstrap.Modal.getInstance(document.getElementById('addClientModal')).hide();
    showNotification('Client ajouté', `${name} a été ajouté à la liste des clients`);
    
    const clientSelect = document.getElementById('invoiceClient');
    if (clientSelect) {
        clientSelect.innerHTML += `<option value="${phone}">${name} - ${phone}</option>`;
    }
}

function deleteClient(phone) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce client ?')) {
        clients = clients.filter(c => c.phone !== phone);
        saveClients();
        showNotification('Client supprimé', 'Le client a été supprimé avec succès');
    }
}

function contactClient(phone) {
    const phoneNumber = phone.replace(/\s/g, '');
    const message = 'Bonjour, je vous contacte de la part de NJEEYGU.';
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
}

function createInvoiceForClient(phone) {
    const client = clients.find(c => c.phone === phone);
    if (!client) return;
    
    showAddInvoiceModal();
    setTimeout(() => {
        const clientSelect = document.getElementById('invoiceClient');
        clientSelect.value = phone;
        updateClientInfo();
    }, 100);
}

function exportClients() {
    const data = clients.map(c => ({
        'Nom': c.name,
        'Téléphone': c.phone,
        'Email': c.email || '',
        'Demandes devis': c.devisCount || 0,
        'Factures': c.invoicesCount || 0,
        'Total dépensé': c.totalSpent || 0,
        'Dernière activité': formatDate(c.lastActivity)
    }));
    
    const csv = convertToCSV(data);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `clients_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    showNotification('Export réussi', 'La liste des clients a été exportée');
}

// ==================== FONCTIONS POUR LES SERVICES ====================
function addService(event) {
    event.preventDefault();
    
    const priceHT = parseInt(document.getElementById('servicePriceHT').value);
    const priceTTC = calculateTTC(priceHT);
    
    const newService = {
        id: services.length + 1,
        name: document.getElementById('serviceName').value,
        description: document.getElementById('serviceDescription').value,
        priceHT: priceHT,
        priceTTC: priceTTC
    };
    
    services.push(newService);
    saveServices();
    
    showServicesTab('list', event);
    showNotification('Service ajouté', `${newService.name} a été ajouté avec succès`);
    
    document.getElementById('addServiceForm').reset();
}

function editService(serviceId) {
    alert(`Édition du service ${serviceId} - Fonctionnalité à implémenter`);
}

function deleteService(serviceId) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce service ?')) {
        services = services.filter(s => s.id !== serviceId);
        saveServices();
        showNotification('Service supprimé', 'Le service a été supprimé avec succès');
    }
}

function showServicesTab(tab, event) {
    document.querySelectorAll('#section-services .services-tab-content').forEach(el => {
        el.style.display = 'none';
    });
    
    if (tab === 'list') {
        document.getElementById('services-list').style.display = 'block';
        updateServicesTable();
    } else if (tab === 'add') {
        document.getElementById('services-add').style.display = 'block';
        document.getElementById('servicePriceTTC').value = '';
    }
    
    document.querySelectorAll('#section-services .admin-tab').forEach(t => {
        t.classList.remove('active');
    });
    event.target.classList.add('active');
}

// ==================== FONCTIONS POUR L'ÉQUIPE ====================
function initTeamUI() {
    const tbody = document.getElementById('teamList');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    team.forEach(member => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><img src="${member.image || 'https://randomuser.me/api/portraits/lego/1.jpg'}" style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover;"></td>
            <td><strong>${member.name}</strong></td>
            <td>${member.position}</td>
            <td>${member.bio || ''}</td>
            <td>
                <button class="action-btn" onclick="editTeamMember(${member.id})"><i class="fas fa-edit"></i></button>
                <button class="action-btn delete" onclick="deleteTeamMember(${member.id})"><i class="fas fa-trash"></i></button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function showTeamTab(tab, event) {
    document.querySelectorAll('#section-equipe .team-tab-content').forEach(el => {
        el.style.display = 'none';
    });
    
    if (tab === 'list') {
        document.getElementById('team-list').style.display = 'block';
        initTeamUI();
    } else if (tab === 'add') {
        document.getElementById('team-add').style.display = 'block';
        document.getElementById('addTeamMemberForm').reset();
    }
    
    document.querySelectorAll('#section-equipe .admin-tab').forEach(t => {
        t.classList.remove('active');
    });
    event.target.classList.add('active');
}

function addTeamMember(event) {
    event.preventDefault();
    
    const name = document.getElementById('memberName').value;
    const position = document.getElementById('memberPosition').value;
    const bio = document.getElementById('memberBio').value;
    const photo = document.getElementById('memberPhoto').value || 'https://randomuser.me/api/portraits/lego/1.jpg';
    
    const newMember = {
        id: team.length + 1,
        name: name,
        position: position,
        bio: bio,
        image: photo
    };
    
    team.push(newMember);
    saveTeam();
    
    showTeamTab('list', event);
    showNotification('Membre ajouté', `${name} a été ajouté à l'équipe`);
}

function deleteTeamMember(memberId) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce membre ?')) {
        team = team.filter(m => m.id !== memberId);
        saveTeam();
        showNotification('Membre supprimé', 'Le membre a été retiré de l\'équipe');
    }
}

function editTeamMember(memberId) {
    alert('Fonctionnalité d\'édition à implémenter');
}

// ==================== FONCTIONS POUR LES SALAIRES ====================
function updateSalariesUI() {
    updateSalariesStats();
    updateEmployeesTable();
    updatePaymentsTable();
    updatePayslipsTable();
    updateSalariesBadge();
    initSalariesCharts();
}

function updateSalariesStats() {
    const totalEmployes = employees.filter(e => e.status === 'actif').length;
    const masseSalariale = employees.filter(e => e.status === 'actif').reduce((sum, emp) => sum + emp.baseSalary + (emp.defaultBonus || 0), 0);
    
    const now = new Date();
    const paiementsCeMois = payments.filter(p => {
        const paymentDate = new Date(p.paymentDate);
        return paymentDate.getMonth() === now.getMonth() && paymentDate.getFullYear() === now.getFullYear();
    }).length;
    
    const nextPayday = new Date(now.getFullYear(), now.getMonth(), 28);
    if (now.getDate() > 28) {
        nextPayday.setMonth(nextPayday.getMonth() + 1);
    }
    const daysUntilPayday = Math.ceil((nextPayday - now) / (1000 * 60 * 60 * 24));
    
    document.getElementById('statEmployes').innerText = totalEmployes;
    document.getElementById('statMasseSalariale').innerText = masseSalariale.toLocaleString('fr-FR') + ' FCFA';
    document.getElementById('statPaiementsMois').innerText = paiementsCeMois;
    document.getElementById('statProchainPaiement').innerText = daysUntilPayday;
}

function updateEmployeesTable() {
    const tbody = document.getElementById('salariesList');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    employees.forEach(emp => {
        const totalSalary = emp.baseSalary + (emp.defaultBonus || 0);
        const statusClass = emp.status === 'actif' ? 'badge-active' : emp.status === 'conge' ? 'badge-pending' : 'badge-inactive';
        const statusLabel = emp.status === 'actif' ? 'Actif' : emp.status === 'conge' ? 'Congé' : 'Inactif';
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><img src="${emp.image || 'https://randomuser.me/api/portraits/lego/1.jpg'}" style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover;"></td>
            <td><strong>${emp.name}</strong></td>
            <td>${emp.position}</td>
            <td>${emp.baseSalary.toLocaleString('fr-FR')} FCFA</td>
            <td>${(emp.defaultBonus || 0).toLocaleString('fr-FR')} FCFA</td>
            <td><strong style="color: var(--rouge-profond);">${totalSalary.toLocaleString('fr-FR')} FCFA</strong></td>
            <td>${new Date(emp.hireDate).toLocaleDateString('fr-FR')}</td>
            <td><span class="badge-status ${statusClass}">${statusLabel}</span></td>
            <td>
                <button class="action-btn" onclick="editEmployee(${emp.id})" title="Modifier"><i class="fas fa-edit"></i></button>
                <button class="action-btn" onclick="payEmployee(${emp.id})" title="Payer"><i class="fas fa-money-bill-wave"></i></button>
                <button class="action-btn pdf" onclick="generatePayslip(${emp.id})" title="Bulletin"><i class="fas fa-file-pdf"></i></button>
                <button class="action-btn delete" onclick="deleteEmployee(${emp.id})" title="Supprimer"><i class="fas fa-user-slash"></i></button>
            </td>
        `;
        tbody.appendChild(row);
    });
    
    if ($.fn.DataTable.isDataTable('#salariesTable')) {
        $('#salariesTable').DataTable().destroy();
    }
    
    $('#salariesTable').DataTable({
        pageLength: 10,
        language: {
            url: '//cdn.datatables.net/plug-ins/1.13.6/i18n/fr-FR.json'
        }
    });
}

function updatePaymentsTable() {
    const tbody = document.getElementById('paymentsList');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    payments.slice(0, 10).forEach(payment => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${new Date(payment.paymentDate).toLocaleDateString('fr-FR')}</td>
            <td><strong>${payment.employeeName}</strong></td>
            <td>${payment.position}</td>
            <td>${payment.period}</td>
            <td>${payment.baseSalary.toLocaleString('fr-FR')} FCFA</td>
            <td>${(payment.bonus || 0).toLocaleString('fr-FR')} FCFA</td>
            <td><strong style="color: var(--rouge-profond);">${payment.total.toLocaleString('fr-FR')} FCFA</strong></td>
            <td><span class="badge-status badge-paid">Payé</span></td>
            <td>
                <button class="action-btn" onclick="viewPayment(${payment.id})"><i class="fas fa-eye"></i></button>
                <button class="action-btn pdf" onclick="generatePayslipForPayment(${payment.id})"><i class="fas fa-download"></i></button>
            </td>
        `;
        tbody.appendChild(row);
    });
    
    if ($.fn.DataTable.isDataTable('#paymentsTable')) {
        $('#paymentsTable').DataTable().destroy();
    }
    
    $('#paymentsTable').DataTable({
        pageLength: 10,
        order: [[0, 'desc']],
        language: {
            url: '//cdn.datatables.net/plug-ins/1.13.6/i18n/fr-FR.json'
        }
    });
}

function updatePayslipsTable() {
    const tbody = document.getElementById('payslipsList');
    if (!tbody) return;
    
    const recentPayslips = payments.slice(0, 10);
    
    tbody.innerHTML = '';
    recentPayslips.forEach(payment => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${payment.period}</td>
            <td><strong>${payment.employeeName}</strong></td>
            <td>${payment.total.toLocaleString('fr-FR')} FCFA</td>
            <td>${new Date(payment.paymentDate).toLocaleDateString('fr-FR')}</td>
            <td>
                <button class="action-btn" onclick="viewPayslip(${payment.id})"><i class="fas fa-eye"></i></button>
                <button class="action-btn pdf" onclick="generatePayslipForPayment(${payment.id})"><i class="fas fa-download"></i></button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function updateSalariesBadge() {
    const now = new Date();
    const pendingPayments = employees.filter(emp => {
        if (emp.status !== 'actif') return false;
        const paidThisMonth = payments.some(p => 
            p.employeeId === emp.id && 
            new Date(p.paymentDate).getMonth() === now.getMonth() &&
            new Date(p.paymentDate).getFullYear() === now.getFullYear()
        );
        return !paidThisMonth;
    }).length;
    
    document.getElementById('salariesBadge').innerText = pendingPayments;
}

function initSalariesCharts() {
    const ctx1 = document.getElementById('salariesChart')?.getContext('2d');
    if (ctx1) {
        if (window.salariesChart) window.salariesChart.destroy();
        
        const activeEmployees = employees.filter(e => e.status === 'actif');
        const employeeNames = activeEmployees.map(emp => emp.name.split(' ')[0]);
        const employeeSalaries = activeEmployees.map(emp => emp.baseSalary + (emp.defaultBonus || 0));
        
        window.salariesChart = new Chart(ctx1, {
            type: 'bar',
            data: {
                labels: employeeNames,
                datasets: [{
                    label: 'Salaire total (FCFA)',
                    data: employeeSalaries,
                    backgroundColor: '#D4AF37',
                    borderRadius: 5
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return value / 1000 + 'k';
                            }
                        }
                    }
                }
            }
        });
    }
    
    const ctx2 = document.getElementById('payrollEvolutionChart')?.getContext('2d');
    if (ctx2) {
        if (window.payrollChart) window.payrollChart.destroy();
        
        const monthlyTotals = {};
        payments.forEach(p => {
            const date = new Date(p.paymentDate);
            const key = `${date.getMonth()+1}/${date.getFullYear()}`;
            monthlyTotals[key] = (monthlyTotals[key] || 0) + p.total;
        });
        
        const sortedMonths = Object.keys(monthlyTotals).sort((a, b) => {
            const [mA, yA] = a.split('/');
            const [mB, yB] = b.split('/');
            return new Date(yA, mA-1) - new Date(yB, mB-1);
        });
        
        window.payrollChart = new Chart(ctx2, {
            type: 'line',
            data: {
                labels: sortedMonths,
                datasets: [{
                    label: 'Masse salariale',
                    data: sortedMonths.map(m => monthlyTotals[m]),
                    borderColor: '#8B0000',
                    backgroundColor: 'rgba(139, 0, 0, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        ticks: {
                            callback: function(value) {
                                return value / 1000 + 'k';
                            }
                        }
                    }
                }
            }
        });
    }
}

function addEmployee(event) {
    event.preventDefault();
    
    const hireDate = document.getElementById('employeeHireDate').value;
    
    const newEmployee = {
        id: employees.length + 1,
        name: document.getElementById('employeeName').value,
        position: document.getElementById('employeePosition').value,
        baseSalary: parseInt(document.getElementById('employeeBaseSalary').value),
        defaultBonus: parseInt(document.getElementById('employeeDefaultBonus').value) || 0,
        hireDate: hireDate,
        phone: document.getElementById('employeePhone').value,
        email: document.getElementById('employeeEmail').value,
        bankAccount: document.getElementById('employeeBankAccount').value,
        status: document.getElementById('employeeStatus').value,
        notes: document.getElementById('employeeNotes').value,
        image: 'https://randomuser.me/api/portraits/lego/' + (Math.floor(Math.random() * 10) + 1) + '.jpg'
    };
    
    employees.push(newEmployee);
    saveEmployees();
    
    showSalariesTab('liste', event);
    showNotification('Employé ajouté', `${newEmployee.name} a été ajouté avec succès`);
    
    document.getElementById('addEmployeeForm').reset();
}

function editEmployee(employeeId) {
    const employee = employees.find(e => e.id === employeeId);
    if (!employee) return;
    
    const newSalary = prompt(`Nouveau salaire de base pour ${employee.name} (FCFA):`, employee.baseSalary);
    if (newSalary && !isNaN(newSalary) && parseInt(newSalary) > 0) {
        employee.baseSalary = parseInt(newSalary);
        saveEmployees();
        showNotification('Salaire modifié', `Le salaire de ${employee.name} a été mis à jour`);
    }
}

function payEmployee(employeeId) {
    const employee = employees.find(e => e.id === employeeId);
    if (!employee) return;
    
    const now = new Date();
    const alreadyPaid = payments.some(p => 
        p.employeeId === employee.id && 
        new Date(p.paymentDate).getMonth() === now.getMonth() &&
        new Date(p.paymentDate).getFullYear() === now.getFullYear()
    );
    
    if (alreadyPaid) {
        if (!confirm(`${employee.name} a déjà été payé ce mois-ci. Voulez-vous ajouter un paiement supplémentaire ?`)) {
            return;
        }
    }
    
    const bonus = prompt(`Prime pour ${employee.name} (FCFA):`, employee.defaultBonus || 0);
    const payment = {
        id: payments.length + 1,
        employeeId: employee.id,
        employeeName: employee.name,
        position: employee.position,
        paymentDate: new Date().toISOString(),
        period: `${now.toLocaleString('fr-FR', { month: 'long' })} ${now.getFullYear()}`,
        baseSalary: employee.baseSalary,
        bonus: parseInt(bonus) || 0,
        total: employee.baseSalary + (parseInt(bonus) || 0),
        status: 'payé',
        paymentMethod: 'virement',
        notes: ''
    };
    
    payments.push(payment);
    savePayments();
    
    showNotification('Paiement effectué', `${payment.total.toLocaleString('fr-FR')} FCFA versés à ${employee.name}`);
}

function deleteEmployee(employeeId) {
    const employee = employees.find(e => e.id === employeeId);
    if (!employee) return;
    
    if (confirm(`Voulez-vous supprimer définitivement ${employee.name} de la liste des employés ?`)) {
        employees = employees.filter(e => e.id !== employeeId);
        saveEmployees();
        showNotification('Employé supprimé', `${employee.name} a été supprimé de la liste`);
    }
}

function generatePayroll() {
    const now = new Date();
    const activeEmployees = employees.filter(e => e.status === 'actif');
    let count = 0;
    
    activeEmployees.forEach(employee => {
        const alreadyPaid = payments.some(p => 
            p.employeeId === employee.id && 
            new Date(p.paymentDate).getMonth() === now.getMonth() &&
            new Date(p.paymentDate).getFullYear() === now.getFullYear()
        );
        
        if (!alreadyPaid) {
            const payment = {
                id: payments.length + 1,
                employeeId: employee.id,
                employeeName: employee.name,
                position: employee.position,
                paymentDate: new Date().toISOString(),
                period: `${now.toLocaleString('fr-FR', { month: 'long' })} ${now.getFullYear()}`,
                baseSalary: employee.baseSalary,
                bonus: employee.defaultBonus || 0,
                total: employee.baseSalary + (employee.defaultBonus || 0),
                status: 'payé',
                paymentMethod: 'virement',
                notes: 'Paie automatique'
            };
            
            payments.push(payment);
            count++;
        }
    });
    
    savePayments();
    showNotification('Paie générée', `${count} employé(s) ont été payés`);
}

// ==================== FONCTION DE GÉNÉRATION DE BULLETIN DE SALAIRE ====================
function generatePayslip(employeeId) {
    const employee = employees.find(e => e.id === employeeId);
    if (!employee) return;
    
    const now = new Date();
    const payment = payments.find(p => 
        p.employeeId === employeeId && 
        new Date(p.paymentDate).getMonth() === now.getMonth() &&
        new Date(p.paymentDate).getFullYear() === now.getFullYear()
    );
    
    if (!payment) {
        alert('Aucun paiement trouvé pour ce mois-ci. Veuillez d\'abord effectuer le paiement.');
        return;
    }
    
    generatePayslipForPayment(payment.id);
}

function generatePayslipForPayment(paymentId) {
    const payment = payments.find(p => p.id === paymentId);
    if (!payment) return;
    
    const employee = employees.find(e => e.id === payment.employeeId);
    if (!employee) return;
    
    currentPayslipData = payment;
    
    const payslipNumber = `BULL-${payment.period.replace(/\s/g, '-')}-${String(employee.id).padStart(3, '0')}`;
    
    const payslipHTML = `
        <div class="invoice-pdf-mobile">
            <div class="invoice-header-mobile">
                <div class="company-info-mobile">
                    <div class="company-logo-mobile">
                        <i class="fas fa-users"></i> ${settings.companyName}
                    </div>
                    <div class="company-contact-mobile">
                        <strong>Décoration d'événements</strong><br>
                        ${settings.companyAddress}<br>
                        <strong>Téléphone:</strong> ${settings.companyPhone}<br>
                        <strong>Email:</strong> ${settings.companyEmail}<br>
                        <strong>RCCM:</strong> SN-DKR-2020-B-12345
                    </div>
                </div>
                <div class="invoice-title-mobile">
                    <h1>BULLETIN DE SALAIRE</h1>
                    <div class="invoice-number-mobile">
                        <strong>N°:</strong> ${payslipNumber}
                    </div>
                    <div style="font-size: 11px;">
                        <strong>Période:</strong> ${payment.period}<br>
                        <strong>Date d'émission:</strong> ${new Date(payment.paymentDate).toLocaleDateString('fr-FR')}
                    </div>
                </div>
            </div>
            
            <div class="invoice-details-mobile">
                <div class="client-info-mobile">
                    <div class="section-title-mobile">INFORMATIONS EMPLOYÉ</div>
                    <div style="font-size: 11px; line-height: 1.4;">
                        <strong>${employee.name}</strong><br>
                        Poste: ${employee.position}<br>
                        Date d'embauche: ${new Date(employee.hireDate).toLocaleDateString('fr-FR')}<br>
                        ${employee.phone ? `Tél: ${employee.phone}<br>` : ''}
                        ${employee.email ? `Email: ${employee.email}<br>` : ''}
                    </div>
                </div>
                
                <div class="order-info-mobile">
                    <div class="section-title-mobile">DÉTAILS DU PAIEMENT</div>
                    <div style="font-size: 11px; line-height: 1.4;">
                        <strong>Méthode de paiement:</strong> ${payment.paymentMethod === 'virement' ? 'Virement bancaire' : payment.paymentMethod}<br>
                        <strong>Compte:</strong> ${employee.bankAccount || 'Non spécifié'}<br>
                        <strong>Statut:</strong> <span style="color: #28a745;">Payé</span>
                    </div>
                </div>
            </div>
            
            <div class="section-title-mobile">COMPOSITION DU SALAIRE</div>
            <table class="invoice-table-mobile">
                <thead>
                    <tr>
                        <th>N°</th>
                        <th>LIBELLÉ</th>
                        <th class="text-right">MONTANT (FCFA)</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>1</td>
                        <td>Salaire de base</td>
                        <td class="text-right">${employee.baseSalary.toLocaleString('fr-FR')}</td>
                    </tr>
                    <tr>
                        <td>2</td>
                        <td>Prime</td>
                        <td class="text-right">${(payment.bonus || 0).toLocaleString('fr-FR')}</td>
                    </tr>
                </tbody>
            </table>
            
            <div class="totals-section-mobile">
                <div class="total-row-mobile">
                    <span><strong>Salaire brut:</strong></span>
                    <span>${(employee.baseSalary + (payment.bonus || 0)).toLocaleString('fr-FR')} FCFA</span>
                </div>
                <div class="total-row-mobile">
                    <span><strong>Cotisations sociales:</strong></span>
                    <span>0 FCFA</span>
                </div>
                <div class="total-row-mobile">
                    <span><strong>IRPP:</strong></span>
                    <span>0 FCFA</span>
                </div>
                <div class="total-row-mobile grand-total-mobile">
                    <span><strong>NET À PAYER:</strong></span>
                    <span><strong>${payment.total.toLocaleString('fr-FR')} FCFA</strong></span>
                </div>
            </div>
            
            <div class="conditions-mobile">
                <strong>Détails du versement:</strong><br>
                • Période concernée: ${payment.period}<br>
                • Date de versement: ${new Date(payment.paymentDate).toLocaleDateString('fr-FR')}<br>
                • Mode de règlement: ${payment.paymentMethod === 'virement' ? 'Virement bancaire' : payment.paymentMethod}<br>
                • Bulletin généré automatiquement
            </div>
            
            <div class="stamp-mobile">
                <div style="font-size: 12px; font-weight: bold; color: var(--vert-emeraude);">
                    <i class="fas fa-check-circle"></i> PAYÉ
                </div>
                <div style="font-size: 10px; margin-top: 3px;">
                    ${new Date().toLocaleDateString('fr-FR')}
                </div>
                <div style="font-size: 9px; margin-top: 5px; color: #666;">
                    Cachet de l'entreprise
                </div>
            </div>
            
            <div class="footer-mobile">
                <p style="margin: 0 0 5px 0; font-size: 10px; font-weight: bold;">
                    Document officiel - Bulletin de salaire
                </p>
                <p style="margin: 0;">
                    NJEEYGU - Le Grand Jour<br>
                    Tél: ${settings.companyPhone} | Email: ${settings.companyEmail}
                </p>
                <p style="margin: 5px 0 0 0; color: #999;">
                    Bulletin généré automatiquement • N° ${payslipNumber}
                </p>
            </div>
        </div>
    `;
    
    document.getElementById('payslipContent').innerHTML = payslipHTML;
    document.getElementById('payslipModalNumber').textContent = payslipNumber;
    
    const modal = new bootstrap.Modal(document.getElementById('payslipModal'));
    modal.show();
}

function downloadPayslipPDF() {
    if (!currentPayslipData) {
        showNotification('Erreur', 'Aucun bulletin à télécharger', 'error');
        return;
    }
    
    showNotification('Génération du PDF en cours...', 'info');
    
    const payslipElement = document.getElementById('payslipContent');
    
    const originalStyles = {
        width: payslipElement.style.width,
        maxWidth: payslipElement.style.maxWidth,
        margin: payslipElement.style.margin,
        padding: payslipElement.style.padding,
        fontSize: payslipElement.style.fontSize,
        lineHeight: payslipElement.style.lineHeight
    };
    
    payslipElement.style.width = '800px';
    payslipElement.style.maxWidth = '800px';
    payslipElement.style.margin = '0 auto';
    payslipElement.style.padding = '20px';
    payslipElement.style.fontSize = '12px';
    payslipElement.style.lineHeight = '1.4';
    payslipElement.style.backgroundColor = '#ffffff';
    
    html2canvas(payslipElement, {
        scale: 3,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        letterRendering: true,
        allowTaint: true,
        width: 800,
        windowWidth: 800,
        onclone: function(clonedDoc) {
            const clonedElement = clonedDoc.getElementById('payslipContent');
            if (clonedElement) {
                clonedElement.style.width = '800px';
                clonedElement.style.maxWidth = '800px';
                clonedElement.style.boxSizing = 'border-box';
                clonedElement.style.fontSize = '12px';
                clonedElement.style.lineHeight = '1.4';
                clonedElement.style.fontFamily = 'Montserrat, sans-serif';
            }
        }
    }).then(canvas => {
        payslipElement.style.width = originalStyles.width;
        payslipElement.style.maxWidth = originalStyles.maxWidth;
        payslipElement.style.margin = originalStyles.margin;
        payslipElement.style.padding = originalStyles.padding;
        payslipElement.style.fontSize = originalStyles.fontSize;
        payslipElement.style.lineHeight = originalStyles.lineHeight;
        
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jspdf.jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });
        
        const imgWidth = 190;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
        
        pdf.save(`Bulletin-${currentPayslipData.employeeName}-${currentPayslipData.period}.pdf`);
        
        showNotification('PDF téléchargé avec succès!', 'success');
    }).catch(error => {
        console.error('Erreur lors de la génération du PDF:', error);
        showNotification('Erreur lors de la génération du PDF', 'error');
        
        payslipElement.style.width = originalStyles.width;
        payslipElement.style.maxWidth = originalStyles.maxWidth;
        payslipElement.style.margin = originalStyles.margin;
        payslipElement.style.padding = originalStyles.padding;
        payslipElement.style.fontSize = originalStyles.fontSize;
        payslipElement.style.lineHeight = originalStyles.lineHeight;
    });
}

function printPayslip() {
    if (!currentPayslipData) {
        showNotification('Erreur', 'Aucun bulletin à imprimer', 'error');
        return;
    }
    
    const printWindow = window.open('', '_blank');
    const payslipContent = document.getElementById('payslipContent').innerHTML;
    
    printWindow.document.write(`
        <!DOCTYPE html>
        <html lang="fr">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Bulletin ${currentPayslipData.employeeName} - ${currentPayslipData.period}</title>
            <style>
                body {
                    font-family: 'Montserrat', Arial, sans-serif;
                    margin: 0;
                    padding: 20px;
                    color: #000;
                    font-size: 12px;
                    line-height: 1.4;
                }
                
                .invoice-pdf-mobile {
                    width: 100%;
                    max-width: 800px;
                    margin: 0 auto;
                    padding: 20px;
                    background: white;
                }
                
                .invoice-header-mobile {
                    display: flex;
                    flex-direction: column;
                    gap: 15px;
                    margin-bottom: 20px;
                    padding-bottom: 15px;
                    border-bottom: 2px solid #D4AF37;
                }
                
                .company-logo-mobile {
                    font-size: 18px;
                    font-weight: bold;
                    color: #8B0000;
                    margin-bottom: 8px;
                }
                
                .invoice-title-mobile h1 {
                    font-size: 22px;
                    font-weight: bold;
                    color: #8B0000;
                    margin: 0 0 10px 0;
                }
                
                .invoice-table-mobile {
                    width: 100%;
                    border-collapse: collapse;
                    margin: 15px 0;
                    font-size: 10px;
                }
                
                .invoice-table-mobile th {
                    background: #8B0000;
                    color: white;
                    padding: 8px 6px;
                    text-align: left;
                    font-weight: bold;
                }
                
                .invoice-table-mobile td {
                    padding: 6px;
                    border-bottom: 1px solid #ddd;
                }
                
                .text-right {
                    text-align: right;
                }
                
                .text-center {
                    text-align: center;
                }
                
                .stamp-mobile {
                    text-align: center;
                    margin: 20px auto;
                    padding: 15px 25px;
                    border: 2px solid #006B54;
                    border-radius: 3px;
                    display: inline-block;
                    transform: rotate(-5deg);
                    background: rgba(0, 107, 84, 0.05);
                }
                
                @media print {
                    body {
                        padding: 0;
                    }
                    .invoice-pdf-mobile {
                        padding: 10mm !important;
                        margin: 0 !important;
                        max-width: 100% !important;
                    }
                    .stamp-mobile {
                        transform: rotate(-5deg) !important;
                    }
                }
            </style>
        </head>
        <body>
            ${payslipContent}
            <script>
                window.onload = function() {
                    window.print();
                    setTimeout(function() {
                        window.close();
                    }, 1000);
                };
            <\/script>
        </body>
        </html>
    `);
    
    printWindow.document.close();
}

function viewPayslip(paymentId) {
    generatePayslipForPayment(paymentId);
}

function generateAllPayslips() {
    alert('Génération de tous les bulletins (simulation)');
}

function exportSalaries() {
    const data = employees.map(emp => ({
        'Employé': emp.name,
        'Poste': emp.position,
        'Salaire de base': emp.baseSalary,
        'Prime': emp.defaultBonus || 0,
        'Total': emp.baseSalary + (emp.defaultBonus || 0),
        'Statut': emp.status
    }));
    
    const csv = convertToCSV(data);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `employes_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    showNotification('Export réussi', 'La liste des employés a été exportée');
}

function exportPayments() {
    const data = payments.map(p => ({
        'Date': new Date(p.paymentDate).toLocaleDateString('fr-FR'),
        'Employé': p.employeeName,
        'Période': p.period,
        'Salaire': p.baseSalary,
        'Prime': p.bonus || 0,
        'Total': p.total
    }));
    
    const csv = convertToCSV(data);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `paiements_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    showNotification('Export réussi', 'L\'historique des paiements a été exporté');
}

function filterPaymentsByMonth() {
    const filter = document.getElementById('paymentMonthFilter').value;
    updatePaymentsTable();
}

function viewPayment(paymentId) {
    const payment = payments.find(p => p.id === paymentId);
    if (payment) {
        alert(`Paiement de ${payment.employeeName}\nMontant: ${payment.total.toLocaleString('fr-FR')} FCFA\nDate: ${new Date(payment.paymentDate).toLocaleDateString('fr-FR')}`);
    }
}

function downloadPaymentReceipt(paymentId) {
    generatePayslipForPayment(paymentId);
}

function downloadPayslip(paymentId) {
    generatePayslipForPayment(paymentId);
}

function showSalariesTab(tab, event) {
    document.querySelectorAll('#section-salaires .salaries-tab-content').forEach(el => {
        el.style.display = 'none';
    });
    
    document.getElementById(`salaires-${tab}`).style.display = 'block';
    
    document.querySelectorAll('#section-salaires .admin-tab').forEach(t => {
        t.classList.remove('active');
    });
    event.target.classList.add('active');
    
    if (tab === 'liste') {
        updateEmployeesTable();
        initSalariesCharts();
    } else if (tab === 'paiements') {
        updatePaymentsTable();
    } else if (tab === 'bulletins') {
        updatePayslipsTable();
    }
}

// ==================== ACTIONS SUR LES PRODUITS ====================
function addProduct(event) {
    event.preventDefault();
    
    const defaultImage = 'https://images.unsplash.com/photo-1478146896981-b80fe463b330?w=200';
    const priceHT = parseInt(document.getElementById('productPriceHT').value);
    const priceTTC = calculateTTC(priceHT);
    
    const newProduct = {
        id: products.length + 1,
        name: document.getElementById('productName').value,
        category: document.getElementById('productCategory').value,
        priceHT: priceHT,
        priceTTC: priceTTC,
        stock: parseInt(document.getElementById('productStock').value),
        minStock: parseInt(document.getElementById('productMinStock').value) || settings.defaultStockAlert,
        status: document.getElementById('productStatus').value,
        image: defaultImage,
        location: document.getElementById('productLocation').value || 'Non défini'
    };
    
    products.push(newProduct);
    saveProducts();
    
    addStockMovement(
        newProduct.id,
        'entree',
        newProduct.stock,
        'reception',
        'Stock initial'
    );
    
    refreshAllUI();
    showProductsTab('list', event);
    showNotification('Produit ajouté', `${newProduct.name} a été ajouté avec succès (TVA 18% incluse)`);
    
    document.getElementById('addProductForm').reset();
}

function editProduct(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const newPrice = prompt(`Nouveau prix HT pour ${product.name} (FCFA):`, product.priceHT);
    if (newPrice && !isNaN(newPrice) && parseInt(newPrice) > 0) {
        product.priceHT = parseInt(newPrice);
        product.priceTTC = calculateTTC(product.priceHT);
        saveProducts();
        showNotification('Prix modifié', `Le prix de ${product.name} a été mis à jour`);
    }
}

function showProductsTab(tab, event) {
    document.querySelectorAll('#section-produits .products-tab-content').forEach(el => {
        el.style.display = 'none';
    });
    
    if (tab === 'list') {
        document.getElementById('products-list').style.display = 'block';
        updateProductsTable();
    } else if (tab === 'add') {
        document.getElementById('products-add').style.display = 'block';
        document.getElementById('addProductForm').reset();
        document.getElementById('productPriceTTC').value = '';
    } else if (tab === 'categories') {
        document.getElementById('products-categories').style.display = 'block';
        updateCategoriesTable();
    }
    
    document.querySelectorAll('#section-produits .admin-tab').forEach(t => {
        t.classList.remove('active');
    });
    event.target.classList.add('active');
}

function showAddCategoryModal() {
    new bootstrap.Modal(document.getElementById('addCategoryModal')).show();
}

function addCategory() {
    const categoryName = document.getElementById('newCategoryName').value;
    if (categoryName) {
        alert(`Catégorie "${categoryName}" ajoutée (simulation)`);
        bootstrap.Modal.getInstance(document.getElementById('addCategoryModal')).hide();
    }
}

function filterStock(filter, event) {
    document.querySelectorAll('#section-stock .admin-tab').forEach(t => t.classList.remove('active'));
    event.target.classList.add('active');
    updateStockTable(filter);
}

// ==================== FONCTIONS POUR LES PARAMÈTRES ====================
function saveSettings(event) {
    event.preventDefault();
    
    settings = {
        companyName: document.getElementById('companyName').value,
        companyEmail: document.getElementById('companyEmail').value,
        companyPhone: document.getElementById('companyPhone').value,
        companyAddress: document.getElementById('companyAddress').value,
        companyWhatsapp: document.getElementById('companyWhatsapp').value,
        currency: document.getElementById('companyCurrency').value,
        tvaRate: 18,
        defaultStockAlert: parseInt(document.getElementById('defaultStockAlert').value)
    };
    
    // Remplacer saveSettings(); par :
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    refreshAllUI();  // Appeler directement refreshAllUI
    
    showNotification('Paramètres enregistrés', 'Les paramètres ont été mis à jour avec succès');
}

function showSettingsTab(tab, event) {
    document.querySelectorAll('#section-parametres .settings-tab-content').forEach(el => {
        el.style.display = 'none';
    });
    
    document.getElementById(`settings-${tab}`).style.display = 'block';
    
    document.querySelectorAll('#section-parametres .admin-tab').forEach(t => {
        t.classList.remove('active');
    });
    event.target.classList.add('active');
}

// ==================== NOTIFICATIONS ====================
function showNotification(title, message, type = 'success') {
    document.getElementById('notificationTitle').innerText = title;
    document.getElementById('notificationMessage').innerText = message;
    
    const toast = document.getElementById('notificationToast');
    if (type === 'error') {
        toast.style.borderLeftColor = '#dc3545';
        toast.querySelector('i').style.color = '#dc3545';
    } else {
        toast.style.borderLeftColor = 'var(--or-eclatant)';
        toast.querySelector('i').style.color = 'var(--or-eclatant)';
    }
    
    toast.style.display = 'block';
    
    setTimeout(() => {
        closeNotification();
    }, 5000);
}

function closeNotification() {
    document.getElementById('notificationToast').style.display = 'none';
}

// ==================== UTILITAIRES ====================
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

function getCategoryLabel(cat) {
    switch(cat) {
        case 'table': return 'Art de la table';
        case 'lumiere': return 'Lumières';
        case 'mariage': return 'Mariage';
        case 'ballon': return 'Ballons';
        case 'deco': return 'Décoration';
        default: return cat;
    }
}

function convertToCSV(data) {
    if (data.length === 0) return '';
    const headers = Object.keys(data[0]);
    const rows = data.map(obj => headers.map(header => obj[header]).join(','));
    return [headers.join(','), ...rows].join('\n');
}

// ==================== NAVIGATION ====================
function showSection(section, event) {
    document.querySelectorAll('.admin-section').forEach(el => {
        el.style.display = 'none';
    });
    
    document.getElementById(`section-${section}`).style.display = 'block';
    
    document.querySelectorAll('.sidebar-menu a').forEach(el => {
        el.classList.remove('active');
    });
    
    event.target.closest('a').classList.add('active');
    
    const titles = {
        'dashboard': 'Tableau de bord',
        'devis': 'Gestion des demandes de devis',
        'produits': 'Gestion des produits',
        'stock': 'Gestion des stocks',
        'factures': 'Gestion des factures',
        'clients': 'Gestion des clients',
        'services': 'Services',
        'equipe': 'Équipe',
        'salaires': 'Gestion des salaires',
        'parametres': 'Paramètres'
    };
    
    document.getElementById('pageTitle').innerText = titles[section] || section;
    
    if (section === 'devis') {
        updateDevisTables();
        updateDevisStats();
    }
    if (section === 'produits') updateProductsTable();
    if (section === 'stock') {
        updateStockTable();
        updateStockMovementsTable();
    }
    if (section === 'factures') updateInvoicesTable();
    if (section === 'clients') updateClientsTable();
    if (section === 'services') updateServicesTable();
    if (section === 'equipe') initTeamUI();
    if (section === 'salaires') {
        updateSalariesUI();
    }
    if (section === 'dashboard') {
        updateStats();
    }
    if (section === 'parametres') {
        document.getElementById('companyName').value = settings.companyName;
        document.getElementById('companyEmail').value = settings.companyEmail;
        document.getElementById('companyPhone').value = settings.companyPhone;
        document.getElementById('companyAddress').value = settings.companyAddress;
        document.getElementById('companyWhatsapp').value = settings.companyWhatsapp;
        document.getElementById('companyCurrency').value = settings.currency;
        document.getElementById('tvaRate').value = settings.tvaRate;
        document.getElementById('defaultStockAlert').value = settings.defaultStockAlert;
    }
}

// ==================== AUTHENTIFICATION ====================
document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    if (username === 'admin' && password === 'admin123') {
        document.getElementById('loginPage').style.display = 'none';
        document.getElementById('adminInterface').style.display = 'block';
        
        initSettings();
        initDevis();
        initProducts();
        initInvoices();
        initClients();
        initServices();
        initEmployees();
        initPayments();
        initTeam();
        initStockMovements();
        
        refreshAllUI();
        updateStockAlerts();
    } else {
        alert('Identifiants incorrects. Utilisez admin / admin123');
    }
});

function handleLogout() {
    document.getElementById('loginPage').style.display = 'flex';
    document.getElementById('adminInterface').style.display = 'none';
}

// ==================== RECHERCHE EN TEMPS RÉEL ====================
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('searchDevis')?.addEventListener('keyup', function(e) {
        const searchTerm = e.target.value.toLowerCase();
        const rows = document.querySelectorAll('#devisList tr');
        
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(searchTerm) ? '' : 'none';
        });
    });
    
    document.getElementById('searchProduct')?.addEventListener('keyup', function(e) {
        const searchTerm = e.target.value.toLowerCase();
        const rows = document.querySelectorAll('#productsList tr');
        
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(searchTerm) ? '' : 'none';
        });
    });
    
    document.getElementById('searchClient')?.addEventListener('keyup', function(e) {
        const searchTerm = e.target.value.toLowerCase();
        const rows = document.querySelectorAll('#clientsList tr');
        
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(searchTerm) ? '' : 'none';
        });
    });
    
    document.getElementById('searchInvoice')?.addEventListener('keyup', function(e) {
        const searchTerm = e.target.value.toLowerCase();
        const rows = document.querySelectorAll('#invoicesList tr');
        
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(searchTerm) ? '' : 'none';
        });
    });
    
    document.getElementById('invoiceClient')?.addEventListener('change', updateClientInfo);
});