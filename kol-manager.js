// KOL Manager for wallet-specific storage
class KOLManager {
    constructor() {
        this.kolGrid = document.querySelector('.kol-grid');
        this.emptyState = document.querySelector('.kol-empty-state');
        this.searchInput = document.querySelector('#kolSearch');
        this.addButton = document.querySelector('#addKOL');
        
        // Initialize event listeners
        this.initializeEventListeners();
    }

    // Initialize event listeners
    initializeEventListeners() {
        this.addButton.addEventListener('click', () => this.handleAddKOL());
        this.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleAddKOL();
            }
        });
    }

    // Get KOLs for current wallet
    getKOLsForWallet(walletAddress) {
        const storedKOLs = localStorage.getItem(`kols_${walletAddress}`);
        return storedKOLs ? JSON.parse(storedKOLs) : [];
    }

    // Save KOLs for current wallet
    saveKOLsForWallet(walletAddress, kols) {
        localStorage.setItem(`kols_${walletAddress}`, JSON.stringify(kols));
    }

    // Add new KOL
    async handleAddKOL() {
        const handle = this.searchInput.value.trim();
        if (!handle) return;

        if (!window.walletAddress) {
            showNotification('Please connect your wallet first', 'error');
            return;
        }

        // Create new KOL object
        const newKOL = {
            id: Date.now(),
            handle: handle,
            name: handle.replace('@', ''),
            status: 'active',
            dateAdded: new Date().toISOString()
        };

        // Get existing KOLs and add new one
        const kols = this.getKOLsForWallet(window.walletAddress);
        kols.push(newKOL);
        
        // Save updated KOLs
        this.saveKOLsForWallet(window.walletAddress, kols);
        
        // Clear input and refresh display
        this.searchInput.value = '';
        this.refreshKOLDisplay();
        
        showNotification('KOL added successfully', 'success');
    }

    // Remove KOL
    removeKOL(kolId) {
        if (!window.walletAddress) return;

        const kols = this.getKOLsForWallet(window.walletAddress);
        const updatedKOLs = kols.filter(kol => kol.id !== kolId);
        
        this.saveKOLsForWallet(window.walletAddress, updatedKOLs);
        this.refreshKOLDisplay();
        
        showNotification('KOL removed successfully', 'success');
    }

    // Toggle KOL status
    toggleKOLStatus(kolId) {
        if (!window.walletAddress) return;

        const kols = this.getKOLsForWallet(window.walletAddress);
        const updatedKOLs = kols.map(kol => {
            if (kol.id === kolId) {
                kol.status = kol.status === 'active' ? 'inactive' : 'active';
            }
            return kol;
        });
        
        this.saveKOLsForWallet(window.walletAddress, updatedKOLs);
        this.refreshKOLDisplay();
    }

    // Create KOL card element
    createKOLCard(kol) {
        const card = document.createElement('div');
        card.className = 'kol-card';
        card.innerHTML = `
            <div class="kol-tracking-status ${kol.status}">
                <i class="fas fa-circle"></i> ${kol.status.charAt(0).toUpperCase() + kol.status.slice(1)}
            </div>
            <div class="kol-card-header">
                <div class="kol-card-avatar">${kol.name.charAt(0).toUpperCase()}</div>
                <div class="kol-card-info">
                    <div class="kol-card-name">${kol.name}</div>
                    <div class="kol-card-handle">
                        <i class="fab fa-twitter"></i> ${kol.handle}
                    </div>
                </div>
            </div>
            <div class="kol-card-body">
                <div class="kol-card-actions">
                    <button class="kol-action-btn ${kol.status === 'active' ? 'secondary' : 'primary'}" onclick="kolManager.toggleKOLStatus(${kol.id})">
                        <i class="fas ${kol.status === 'active' ? 'fa-pause' : 'fa-play'}"></i>
                        ${kol.status === 'active' ? 'Pause' : 'Activate'}
                    </button>
                    <button class="kol-action-btn danger" onclick="kolManager.removeKOL(${kol.id})">
                        <i class="fas fa-times"></i> Remove
                    </button>
                </div>
            </div>
        `;
        return card;
    }

    // Refresh KOL display
    refreshKOLDisplay() {
        if (!window.walletAddress) {
            this.emptyState.style.display = 'flex';
            return;
        }

        const kols = this.getKOLsForWallet(window.walletAddress);
        
        // Clear existing cards
        while (this.kolGrid.firstChild) {
            this.kolGrid.removeChild(this.kolGrid.firstChild);
        }

        if (kols.length === 0) {
            this.emptyState.style.display = 'flex';
            this.kolGrid.appendChild(this.emptyState);
        } else {
            this.emptyState.style.display = 'none';
            kols.forEach(kol => {
                this.kolGrid.appendChild(this.createKOLCard(kol));
            });
        }
    }
}

// Initialize KOL manager
const kolManager = new KOLManager();

// Listen for wallet connection/disconnection
document.addEventListener('walletConnected', (e) => {
    kolManager.refreshKOLDisplay();
});

document.addEventListener('walletDisconnected', () => {
    kolManager.refreshKOLDisplay();
}); 