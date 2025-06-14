
// Global Variables
let currentUser = null;
let isAdmin = false;
let currentPreviewFile = null;
let isDarkTheme = false;
let samplePDFs = [];

// Storage management constants
const STORAGE_LIMITS = {
  MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB per file
  MAX_TOTAL_STORAGE: 800 * 1024 * 1024, // 800MB total
  WARNING_THRESHOLD: 0.8, // 80% warning
  CRITICAL_THRESHOLD: 0.9 // 90% critical
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    try {
        initializeApp();
    } catch (error) {
        console.error('Error initializing app:', error);
        showError('Failed to initialize application: ' + error.message);
    }
});

function initializeApp() {
    try {
        // Load uploaded PDFs with error handling
        loadStoredPDFs();
        
        // Check if user is already logged in
        checkLoginStatus();
        
        // Initialize storage monitoring
        monitorStorageUsage();
        
    } catch (error) {
        console.error('Error in initializeApp:', error);
        showError('Failed to initialize app properly: ' + error.message);
    }
}

function loadStoredPDFs() {
    try {
        // First try to load from localStorage
        const uploadedPDFs = localStorage.getItem('uploadedPDFs');
        if (uploadedPDFs) {
            const parsed = JSON.parse(uploadedPDFs);
            if (Array.isArray(parsed)) {
                samplePDFs.length = 0; // Clear existing
                samplePDFs.push(...parsed); // Add uploaded PDFs
            }
        }
        
        // Then try to restore session data for large files
        if (window.sessionPDFs && Array.isArray(window.sessionPDFs)) {
            // Merge session data with localStorage data
            window.sessionPDFs.forEach(sessionPdf => {
                const existingIndex = samplePDFs.findIndex(pdf => pdf.id === sessionPdf.id);
                if (existingIndex !== -1) {
                    // Update existing PDF with session data
                    samplePDFs[existingIndex] = { ...samplePDFs[existingIndex], ...sessionPdf };
                } else {
                    // Add new PDF from session
                    samplePDFs.push(sessionPdf);
                }
            });
        }
        
    } catch (error) {
        console.error('Error loading stored PDFs:', error);
        showError('Failed to load some PDF files from storage');
    }
}

function checkLoginStatus() {
    try {
        // Check if user was previously logged in
        const savedUser = localStorage.getItem('currentUser');
        const savedAdmin = localStorage.getItem('isAdmin');
        
        if (savedUser) {
            currentUser = savedUser;
            isAdmin = savedAdmin === 'true';
            showMainPage();
        } else {
            showMainPage();
        }
    } catch (error) {
        console.error('Error checking login status:', error);
        showMainPage(); // Fallback to main page
    }
}



// Authentication Functions
function togglePasswordVisibility() {
    try {
        const passwordInput = document.getElementById('password');
        const toggleIcon = document.getElementById('passwordToggleIcon');
        
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            toggleIcon.textContent = '🙈';
        } else {
            passwordInput.type = 'password';
            toggleIcon.textContent = '👁️';
        }
    } catch (error) {
        console.error('Error toggling password visibility:', error);
    }
}

function login(event) {
    if (event) {
        event.preventDefault();
    }
    
    try {
        showLoading(true);
        
        const email = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        if (!email || !password) {
            showError('Please enter both email and password');
            showLoading(false);
            return;
        }
        
        // Simulate login delay
        setTimeout(() => {
            try {
                // Demo login logic with specific admin credentials
                currentUser = email;
                isAdmin = (email === 'admin@pdfplace.com' && password === 'admin123') || 
                         (email === 'ak763145918@gmail.com' && password === '76730');
                
                // Save login state
                localStorage.setItem('currentUser', currentUser);
                localStorage.setItem('isAdmin', isAdmin.toString());
                
                showMainApp();
                showSuccess(isAdmin ? 'Admin login successful!' : 'User login successful!');
                showLoading(false);
            } catch (error) {
                console.error('Login processing error:', error);
                showError('Login processing failed');
                showLoading(false);
            }
        }, 1000);
        
    } catch (error) {
        console.error('Login error:', error);
        showError('Login failed: ' + error.message);
        showLoading(false);
    }
}

function logout() {
    try {
        showLoading(true);
        
        setTimeout(() => {
            try {
                currentUser = null;
                isAdmin = false;
                
                // Clear login state
                localStorage.removeItem('currentUser');
                localStorage.removeItem('isAdmin');
                
                showMainPage();
                showSuccess('Logged out successfully!');
                showLoading(false);
            } catch (error) {
                console.error('Logout processing error:', error);
                showError('Logout processing failed');
                showLoading(false);
            }
        }, 500);
        
    } catch (error) {
        console.error('Logout error:', error);
        showError('Logout failed: ' + error.message);
        showLoading(false);
    }
}

function showMainPage() {
    try {
        const loginSection = document.getElementById('loginSection');
        const mainApp = document.getElementById('mainApp');
        const currentUserElement = document.getElementById('currentUser');
        const uploadSection = document.getElementById('uploadSection');
        const loginButton = document.getElementById('loginButton');
        const userInfo = document.getElementById('userInfo');
        
        if (loginSection) loginSection.style.display = 'none';
        if (mainApp) mainApp.style.display = 'block';
        
        // Show login button if not logged in
        if (!currentUser) {
            if (loginButton) loginButton.style.display = 'block';
            if (userInfo) userInfo.style.display = 'none';
            if (currentUserElement) currentUserElement.textContent = 'Welcome! Please login to access features.';
            if (uploadSection) uploadSection.style.display = 'none';
            
            // Disable interactive features
            disableFeatures();
        } else {
            if (loginButton) loginButton.style.display = 'none';
            if (userInfo) userInfo.style.display = 'flex';
            if (currentUserElement) currentUserElement.textContent = `Welcome, ${currentUser}!${isAdmin ? ' (Admin)' : ''}`;
            if (uploadSection) uploadSection.style.display = isAdmin ? 'block' : 'none';
            
            // Show admin controls if admin
            const adminControls = document.getElementById('adminControls');
            if (adminControls) adminControls.style.display = isAdmin ? 'block' : 'none';
            
            // Enable interactive features
            enableFeatures();
            loadPDFs();
            loadDownloads();
            loadComments();
            loadStorageInfo();
        }
    } catch (error) {
        console.error('Error showing main page:', error);
    }
}

function showLoginSection() {
    const loginSection = document.getElementById('loginSection');
    const mainApp = document.getElementById('mainApp');
    
    if (loginSection) loginSection.style.display = 'flex';
    if (mainApp) mainApp.style.display = 'none';
}

function disableFeatures() {
    // Show message for features that require login
    const pdfList = document.getElementById('pdfList');
    const downloadsList = document.getElementById('downloadsList');
    const commentsList = document.getElementById('commentsList');
    
    if (pdfList) {
        pdfList.innerHTML = '<div class="login-required"><p>Please login to view and manage PDF files.</p></div>';
    }
    if (downloadsList) {
        downloadsList.innerHTML = '<div class="login-required"><p>Please login to view download history.</p></div>';
    }
    if (commentsList) {
        commentsList.innerHTML = '<div class="login-required"><p>Please login to view and submit feedback.</p></div>';
    }
}

function enableFeatures() {
    // Features will be enabled when data is loaded
}

function showMainApp() {
    // After successful login, update the main page to show user features
    showMainPage();
}

// Forgot Password Functions
function showForgotPassword() {
    const modal = document.getElementById('forgotPasswordModal');
    if (modal) {
        modal.style.display = 'flex';
    }
}

function closeForgotPassword() {
    const modal = document.getElementById('forgotPasswordModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function sendPasswordReset() {
    const email = document.getElementById('resetEmail').value.trim();
    if (!email) {
        showError('Please enter your email address');
        return;
    }
    
    // Simulate password reset
    showSuccess('Password reset instructions sent to your email!');
    closeForgotPassword();
}

// Tab Navigation
function showTab(tabName) {
    try {
        // Hide all tab contents
        const tabContents = document.querySelectorAll('.tab-content');
        tabContents.forEach(tab => {
            tab.classList.remove('active');
        });
        
        // Remove active class from all tab buttons
        const tabButtons = document.querySelectorAll('.tab-btn');
        tabButtons.forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Show selected tab content
        const selectedTab = document.getElementById(tabName + 'Tab');
        if (selectedTab) {
            selectedTab.classList.add('active');
        }
        
        // Add active class to clicked button
        const clickedButton = event.target;
        if (clickedButton) {
            clickedButton.classList.add('active');
        }
        
        // Load data for specific tabs
        if (tabName === 'downloads') {
            loadDownloads();
        } else if (tabName === 'comments') {
            loadComments();
        }
    } catch (error) {
        console.error('Error showing tab:', error);
    }
}

// File Upload Functions with improved storage management
function uploadPDF(event) {
    if (event) {
        event.preventDefault();
    }
    
    try {
        if (!isAdmin) {
            showError('Upload permission denied. Admin access required.');
            return;
        }
        
        const fileInput = document.getElementById('pdfFile');
        const categorySelect = document.getElementById('categorySelect');
        const statusDiv = document.getElementById('uploadStatus');
        
        if (!fileInput.files[0]) {
            showError('Please select a PDF file');
            return;
        }
        
        const file = fileInput.files[0];
        if (file.type !== 'application/pdf') {
            showError('Please select a valid PDF file');
            return;
        }
        
        // Check file size
        if (file.size > STORAGE_LIMITS.MAX_FILE_SIZE) {
            showError(`File size too large. Maximum size is ${formatFileSize(STORAGE_LIMITS.MAX_FILE_SIZE)}.`);
            return;
        }
        
        // Check total storage
        const currentUsage = getCurrentStorageUsage();
        if (currentUsage + file.size > STORAGE_LIMITS.MAX_TOTAL_STORAGE) {
            showError('Not enough storage space. Please clear some files first.');
            return;
        }
        
        showLoading(true);
        statusDiv.innerHTML = '<div class="loading-spinner"></div> Uploading...';
        
        // Read file and create new PDF entry
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                // Check if we have a valid result
                if (!e.target || !e.target.result) {
                    throw new Error('Failed to read file data');
                }
                
                // Create new PDF object with file data
                const newPDF = {
                    id: Date.now(),
                    filename: file.name,
                    category: categorySelect.value,
                    upload_date: new Date().toLocaleDateString(),
                    size: file.size,
                    download_count: 0,
                    file_data: e.target.result,
                    upload_timestamp: Date.now()
                };
                
                // Add to the list and save
                samplePDFs.unshift(newPDF);
                saveUploadedPDFs();
                loadPDFs();
                loadStorageInfo();
                
                // Reset form
                document.getElementById('uploadForm').reset();
                statusDiv.innerHTML = '';
                showLoading(false);
                showSuccess('File uploaded successfully!');
                
            } catch (error) {
                console.error('Upload processing error:', error);
                showError('Upload failed: ' + error.message);
                statusDiv.innerHTML = '';
                showLoading(false);
            }
        };
        
        reader.onerror = function() {
            showError('Failed to read file. Please try again.');
            statusDiv.innerHTML = '';
            showLoading(false);
        };
        
        reader.readAsDataURL(file);
        
    } catch (error) {
        console.error('Upload error:', error);
        showError('Upload failed: ' + error.message);
        showLoading(false);
    }
}

function saveUploadedPDFs() {
    try {
        // Clean up old file data URLs to prevent memory leaks
        cleanupOldFileData();
        
        // Create a copy for localStorage with size management
        const pdfsCopy = samplePDFs.map(pdf => {
            // For very large files, store metadata only in localStorage
            if (pdf.file_data && pdf.file_data.length > 2 * 1024 * 1024) { // 2MB limit for localStorage
                return {
                    ...pdf,
                    file_data: null,
                    has_large_file: true,
                    stored_in_session: true
                };
            }
            return pdf;
        });
        
        // Try to save to localStorage
        const dataToSave = JSON.stringify(pdfsCopy);
        
        // Check if we can save this amount of data
        if (dataToSave.length > 4 * 1024 * 1024) { // 4MB localStorage limit
            throw new Error('Data too large for localStorage');
        }
        
        localStorage.setItem('uploadedPDFs', dataToSave);
        
        // Keep original data in memory for current session
        window.sessionPDFs = [...samplePDFs];
        
        // Update storage info
        updateStorageInfo();
        
    } catch (error) {
        console.error('Error saving PDFs to localStorage:', error);
        
        // Fallback: save metadata only
        try {
            const metadataOnly = samplePDFs.map(pdf => ({
                id: pdf.id,
                filename: pdf.filename,
                category: pdf.category,
                upload_date: pdf.upload_date,
                size: pdf.size,
                download_count: pdf.download_count,
                has_large_file: Boolean(pdf.file_data),
                stored_in_session: true
            }));
            
            localStorage.setItem('uploadedPDFs', JSON.stringify(metadataOnly));
            window.sessionPDFs = [...samplePDFs];
            
        } catch (fallbackError) {
            console.error('Fallback save failed:', fallbackError);
            showError('Storage full. Some files may not be saved permanently.');
        }
    }
}

function cleanupOldFileData() {
    try {
        // Clean up any orphaned object URLs
        if (window.pdfObjectUrls) {
            window.pdfObjectUrls.forEach(url => {
                URL.revokeObjectURL(url);
            });
            window.pdfObjectUrls = [];
        }
        
        // Initialize cleanup tracking
        if (!window.pdfObjectUrls) {
            window.pdfObjectUrls = [];
        }
        
    } catch (error) {
        console.error('Error cleaning up file data:', error);
    }
}

function getCurrentStorageUsage() {
    try {
        let totalSize = 0;
        samplePDFs.forEach(pdf => {
            if (pdf.file_data) {
                // Estimate size of base64 data
                totalSize += pdf.file_data.length * 0.75; // base64 overhead
            }
        });
        return totalSize;
    } catch (error) {
        console.error('Error calculating storage usage:', error);
        return 0;
    }
}

function updateStorageInfo() {
    try {
        const usage = getCurrentStorageUsage();
        const percentage = (usage / STORAGE_LIMITS.MAX_TOTAL_STORAGE) * 100;
        
        if (percentage > STORAGE_LIMITS.CRITICAL_THRESHOLD * 100) {
            showError('Storage is critically full. Please clear some files.');
        } else if (percentage > STORAGE_LIMITS.WARNING_THRESHOLD * 100) {
            showError('Storage is getting full. Consider clearing some files.');
        }
        
    } catch (error) {
        console.error('Error updating storage info:', error);
    }
}

// PDF Management Functions
function loadPDFs() {
    const pdfList = document.getElementById('pdfList');
    if (!pdfList) return;
    
    try {
        if (samplePDFs.length === 0) {
            pdfList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">📄</div>
                    <h3>No PDFs Found</h3>
                    <p>No PDF files have been uploaded yet. ${isAdmin ? 'Upload some files to get started!' : 'Check back later for new content.'}</p>
                </div>
            `;
            return;
        }
        
        const pdfItems = samplePDFs.map(pdf => {
            const sizeFormatted = formatFileSize(pdf.size);
            const categoryClass = pdf.category || 'others';
            const hasRealData = pdf.file_data && pdf.file_data.startsWith('data:');
            const hasSessionData = window.sessionPDFs && window.sessionPDFs.find(p => p.id === pdf.id && p.file_data);
            const canPreview = hasRealData || hasSessionData;
            const fileTypeIndicator = canPreview ? '🟢 Available' : '❌ Data Missing';
            
            return `
                <div class="pdf-item" data-category="${pdf.category}" data-filename="${pdf.filename.toLowerCase()}">
                    <div class="pdf-header">
                        <div class="pdf-info">
                            <h3>${escapeHtml(pdf.filename)} <span class="file-type-indicator ${canPreview ? 'real-file' : 'sample-file'}">${fileTypeIndicator}</span></h3>
                            <div class="pdf-meta">
                                <span>📅 ${pdf.upload_date}</span>
                                <span>📏 ${sizeFormatted}</span>
                                <span>📥 ${pdf.download_count} downloads</span>
                                <span class="category-badge ${categoryClass}">${getCategoryDisplayName(pdf.category)}</span>
                            </div>
                        </div>
                    </div>
                    <div class="pdf-actions">
                        <button onclick="previewPDF('${pdf.id}')" class="action-btn preview-btn" ${!canPreview ? 'title="Preview not available for sample data"' : ''}>
                            👁️ Preview
                        </button>
                        <button onclick="downloadPDF('${pdf.id}')" class="action-btn download-btn">
                            📥 Download
                        </button>
                        ${isAdmin ? `<button onclick="deletePDF('${pdf.id}')" class="action-btn delete-btn">🗑️ Delete</button>` : ''}
                    </div>
                </div>
            `;
        }).join('');
        
        pdfList.innerHTML = pdfItems;
        
    } catch (error) {
        console.error('Error loading PDFs:', error);
        pdfList.innerHTML = `
            <div class="error-state">
                <div class="error-icon">❌</div>
                <h3>Loading Error</h3>
                <p>Failed to load PDF files. Please try refreshing the page.</p>
                <button onclick="loadPDFs()" class="retry-btn">Try Again</button>
            </div>
        `;
    }
}

function searchPDFs() {
    const searchInput = document.getElementById('searchInput');
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
    
    const pdfItems = document.querySelectorAll('.pdf-item');
    pdfItems.forEach(item => {
        const filename = item.getAttribute('data-filename') || '';
        if (filename.includes(searchTerm)) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
}

function filterByCategory() {
    const categoryFilter = document.getElementById('categoryFilter');
    const selectedCategory = categoryFilter ? categoryFilter.value : '';
    
    const pdfItems = document.querySelectorAll('.pdf-item');
    pdfItems.forEach(item => {
        const category = item.getAttribute('data-category') || '';
        if (!selectedCategory || category === selectedCategory) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
}

function previewPDF(pdfId) {
    try {
        const pdf = samplePDFs.find(p => p.id == pdfId);
        if (!pdf) {
            showError('PDF not found');
            return;
        }
        
        showLoading(true);
        
        setTimeout(() => {
            try {
                let pdfDataUrl = getPDFData(pdf);
                
                // If no real data available, create a sample PDF for preview
                if (!pdfDataUrl || !pdfDataUrl.startsWith('data:')) {
                    const sampleContent = createSamplePDFContent(pdf.filename);
                    const blob = new Blob([sampleContent], { type: 'application/pdf' });
                    pdfDataUrl = URL.createObjectURL(blob);
                }
                
                // Open PDF in new tab for preview
                const newWindow = window.open(pdfDataUrl, '_blank');
                
                if (!newWindow) {
                    // Fallback to download if popup blocked
                    showError('Popup blocked. Downloading file instead...');
                    downloadPDF(pdfId);
                } else {
                    showSuccess(`Preview opened: ${pdf.filename}`);
                }
                
                showLoading(false);
                
            } catch (error) {
                console.error('Preview error:', error);
                showError('Preview failed. Downloading instead...');
                downloadPDF(pdfId);
                showLoading(false);
            }
        }, 300);
        
    } catch (error) {
        console.error('Preview error:', error);
        showError('Preview failed: ' + error.message);
        showLoading(false);
    }
}

function downloadPDF(pdfId) {
    try {
        const pdf = samplePDFs.find(p => p.id == pdfId);
        if (!pdf) {
            showError('PDF not found');
            return;
        }
        
        showLoading(true);
        
        setTimeout(() => {
            try {
                let downloadSuccess = false;
                let pdfDataUrl = getPDFData(pdf);
                
                if (pdfDataUrl && pdfDataUrl.startsWith('data:')) {
                    // Download actual uploaded file
                    downloadSuccess = downloadFromData(pdfDataUrl, pdf.filename);
                } else {
                    // Create and download sample PDF for demo files
                    downloadSuccess = createAndDownloadSamplePDF(pdf.filename);
                }
                
                if (downloadSuccess) {
                    // Update download count
                    pdf.download_count = (pdf.download_count || 0) + 1;
                    saveUploadedPDFs();
                    
                    // Add to download history
                    addToDownloadHistory(pdf);
                    
                    // Update UI
                    loadPDFs();
                    showSuccess(`Downloaded: ${pdf.filename}`);
                } else {
                    showError('Download failed. Please try again.');
                }
                
            } catch (error) {
                console.error('Download processing error:', error);
                showError('Download failed: ' + error.message);
            } finally {
                showLoading(false);
            }
        }, 500);
        
    } catch (error) {
        console.error('Download error:', error);
        showError('Download failed: ' + error.message);
        showLoading(false);
    }
}

function downloadCurrentPDF() {
    if (currentPreviewFile) {
        downloadPDF(currentPreviewFile.id);
    } else {
        showError('No PDF selected for download');
    }
}

function getPDFData(pdf) {
    try {
        // First check if we have file_data directly
        if (pdf.file_data && pdf.file_data.startsWith('data:')) {
            return pdf.file_data;
        }
        
        // Then check session storage for large files
        if (window.sessionPDFs) {
            const sessionPdf = window.sessionPDFs.find(p => p.id === pdf.id);
            if (sessionPdf && sessionPdf.file_data && sessionPdf.file_data.startsWith('data:')) {
                return sessionPdf.file_data;
            }
        }
        
        return null;
    } catch (error) {
        console.error('Error getting PDF data:', error);
        return null;
    }
}

function downloadFromData(dataUrl, filename) {
    try {
        if (!dataUrl || !dataUrl.startsWith('data:')) {
            console.error('Invalid data URL provided');
            return false;
        }
        
        // Create download link
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = filename || 'download.pdf';
        link.style.display = 'none';
        
        // Add to DOM and trigger download
        document.body.appendChild(link);
        link.click();
        
        // Clean up
        setTimeout(() => {
            try {
                document.body.removeChild(link);
            } catch (e) {
                console.log('Link already removed');
            }
        }, 100);
        
        return true;
    } catch (error) {
        console.error('Error downloading from data URL:', error);
        return false;
    }
}

function createSamplePDFContent(filename) {
    return `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
/Resources <<
/Font <<
/F1 5 0 R
>>
>>
>>
endobj

4 0 obj
<<
/Length 200
>>
stream
BT
/F1 14 Tf
50 750 Td
(PDF PLACE - Educational Resource) Tj
0 -30 Td
(File: ${filename.replace(/[()\\]/g, '\\$&')}) Tj
0 -30 Td
(This is a demonstration PDF file.) Tj
0 -30 Td
(Visit PDF PLACE for more educational resources.) Tj
ET
endstream
endobj

5 0 obj
<<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
endobj

xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000268 00000 n 
0000000500 00000 n 
trailer
<<
/Size 6
/Root 1 0 R
>>
startxref
580
%%EOF`;
}

function createAndDownloadSamplePDF(filename) {
    try {
        const pdfContent = createSamplePDFContent(filename);
        const blob = new Blob([pdfContent], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.style.display = 'none';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        setTimeout(() => {
            URL.revokeObjectURL(url);
        }, 1000);
        
        return true;
    } catch (error) {
        console.error('Error creating sample PDF:', error);
        return false;
    }
}

function deletePDF(pdfId) {
    if (!isAdmin) {
        showError('Delete permission denied. Admin access required.');
        return;
    }
    
    if (!confirm('Are you sure you want to delete this PDF?')) {
        return;
    }
    
    try {
        const index = samplePDFs.findIndex(p => p.id == pdfId);
        if (index !== -1) {
            const deletedPDF = samplePDFs.splice(index, 1)[0];
            
            // Clean up file data
            if (deletedPDF.file_data) {
                deletedPDF.file_data = null;
            }
            
            saveUploadedPDFs();
            loadPDFs();
            loadStorageInfo();
            showSuccess(`Deleted: ${deletedPDF.filename}`);
        } else {
            showError('PDF not found');
        }
    } catch (error) {
        console.error('Delete error:', error);
        showError('Delete failed: ' + error.message);
    }
}

function addToDownloadHistory(pdf) {
    try {
        const downloads = getDownloadHistory();
        const downloadEntry = {
            id: Date.now(),
            filename: pdf.filename,
            category: pdf.category,
            download_date: new Date().toISOString(),
            size: pdf.size
        };
        
        downloads.unshift(downloadEntry);
        
        // Keep only last 100 downloads
        if (downloads.length > 100) {
            downloads.splice(100);
        }
        
        localStorage.setItem('downloadHistory', JSON.stringify(downloads));
    } catch (error) {
        console.error('Error saving download history:', error);
    }
}

function getDownloadHistory() {
    try {
        const downloads = localStorage.getItem('downloadHistory');
        return downloads ? JSON.parse(downloads) : [];
    } catch (error) {
        console.error('Error loading download history:', error);
        return [];
    }
}

function loadDownloads() {
    const downloadsList = document.getElementById('downloadsList');
    if (!downloadsList) return;
    
    try {
        const downloads = getDownloadHistory();
        
        if (downloads.length === 0) {
            downloadsList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">📥</div>
                    <h3>No Downloads Yet</h3>
                    <p>Your download history will appear here after you download some files.</p>
                </div>
            `;
            return;
        }
        
        const downloadItems = downloads.map(download => {
            const downloadDate = new Date(download.download_date);
            const formattedDate = downloadDate.toLocaleDateString();
            const formattedTime = downloadDate.toLocaleTimeString();
            const sizeFormatted = formatFileSize(download.size);
            
            return `
                <div class="download-item">
                    <div class="download-info">
                        <h4>${escapeHtml(download.filename)}</h4>
                        <p>Downloaded on ${formattedDate} at ${formattedTime} • ${sizeFormatted}</p>
                    </div>
                    <div class="download-actions">
                        <span class="category-badge ${download.category || 'others'}">${getCategoryDisplayName(download.category)}</span>
                    </div>
                </div>
            `;
        }).join('');
        
        downloadsList.innerHTML = downloadItems;
        
    } catch (error) {
        console.error('Error loading downloads:', error);
        downloadsList.innerHTML = `
            <div class="error-state">
                <div class="error-icon">❌</div>
                <h3>Loading Error</h3>
                <p>Failed to load download history.</p>
                <button onclick="loadDownloads()" class="retry-btn">Try Again</button>
            </div>
        `;
    }
}

function filterDownloads() {
    const filter = document.getElementById('downloadsFilter');
    const filterValue = filter ? filter.value : '';
    
    // This would filter downloads based on the selected time period
    // For now, just reload all downloads
    loadDownloads();
}

function clearDownloadHistory() {
    if (!confirm('Are you sure you want to clear your download history?')) {
        return;
    }
    
    try {
        localStorage.removeItem('downloadHistory');
        loadDownloads();
        showSuccess('Download history cleared successfully!');
    } catch (error) {
        console.error('Error clearing download history:', error);
        showError('Failed to clear download history');
    }
}

// Comments Functions
function submitComment(event) {
    if (event) {
        event.preventDefault();
    }
    
    try {
        const commentText = document.getElementById('commentText').value.trim();
        const commentCategory = document.getElementById('commentCategory').value;
        
        if (!commentText) {
            showError('Please enter your feedback');
            return;
        }
        
        if (!currentUser) {
            showError('Please login to submit feedback');
            return;
        }
        
        const comment = {
            id: Date.now(),
            user: currentUser,
            text: commentText,
            category: commentCategory,
            date: new Date().toISOString(),
            timestamp: Date.now()
        };
        
        // Save comment
        const comments = getComments();
        comments.unshift(comment);
        localStorage.setItem('userComments', JSON.stringify(comments));
        
        // Reset form
        document.getElementById('feedbackForm').reset();
        
        // Reload comments
        loadComments();
        showSuccess('Feedback submitted successfully!');
        
    } catch (error) {
        console.error('Error submitting comment:', error);
        showError('Failed to submit feedback: ' + error.message);
    }
}

function getComments() {
    try {
        const comments = localStorage.getItem('userComments');
        return comments ? JSON.parse(comments) : [];
    } catch (error) {
        console.error('Error loading comments:', error);
        return [];
    }
}

function loadComments() {
    const commentsList = document.getElementById('commentsList');
    if (!commentsList) return;
    
    try {
        const comments = getComments();
        
        if (comments.length === 0) {
            commentsList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">💬</div>
                    <h3>No Feedback Yet</h3>
                    <p>Be the first to share your feedback and help us improve!</p>
                </div>
            `;
            return;
        }
        
        const commentItems = comments.map(comment => {
            const commentDate = new Date(comment.date);
            const formattedDate = commentDate.toLocaleDateString();
            const formattedTime = commentDate.toLocaleTimeString();
            
            return `
                <div class="comment-item">
                    <div class="comment-header">
                        <span class="comment-user">${escapeHtml(comment.user)}</span>
                        <span class="comment-date">${formattedDate} at ${formattedTime}</span>
                    </div>
                    <div class="comment-content">
                        ${escapeHtml(comment.text)}
                    </div>
                    <div class="comment-category ${comment.category}">
                        ${getCategoryIcon(comment.category)} ${getCategoryDisplayName(comment.category)}
                    </div>
                </div>
            `;
        }).join('');
        
        commentsList.innerHTML = commentItems;
        
    } catch (error) {
        console.error('Error loading comments:', error);
        commentsList.innerHTML = `
            <div class="error-state">
                <div class="error-icon">❌</div>
                <h3>Loading Error</h3>
                <p>Failed to load feedback.</p>
                <button onclick="loadComments()" class="retry-btn">Try Again</button>
            </div>
        `;
    }
}

// Storage Management with improved error handling
function loadStorageInfo() {
    // Storage info display removed for cleaner UI
}

function monitorStorageUsage() {
    try {
        // Check storage usage periodically
        setInterval(() => {
            const usage = getCurrentStorageUsage();
            const percentage = (usage / STORAGE_LIMITS.MAX_TOTAL_STORAGE) * 100;
            
            if (percentage > STORAGE_LIMITS.CRITICAL_THRESHOLD * 100) {
                console.warn('Storage usage critical:', percentage.toFixed(1) + '%');
            }
        }, 60000); // Check every minute
        
    } catch (error) {
        console.error('Error setting up storage monitoring:', error);
    }
}

// Utility Functions
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function getCategoryDisplayName(category) {
    const categoryNames = {
        'mocktest': 'Mock Test',
        'ncert': 'NCERT',
        'pyqs': 'PYQs',
        'pw-notes': 'PW Notes',
        'kgs-notes': 'KGS Notes',
        'others': 'Others'
    };
    return categoryNames[category] || 'Others';
}

function getCategoryIcon(category) {
    const categoryIcons = {
        'suggestion': '💡',
        'bug': '🐛',
        'feature': '✨',
        'general': '💬'
    };
    return categoryIcons[category] || '💬';
}

// Toast Notifications
function showError(message) {
    showToast('errorToast', 'errorMessage', message);
}

function showSuccess(message) {
    showToast('successToast', 'successMessage', message);
}

function showToast(toastId, messageId, message) {
    try {
        const toast = document.getElementById(toastId);
        const messageElement = document.getElementById(messageId);
        
        if (toast && messageElement) {
            messageElement.textContent = message;
            toast.style.display = 'flex';
            
            // Auto hide after 5 seconds
            setTimeout(() => {
                hideToast(toastId);
            }, 5000);
        }
    } catch (error) {
        console.error('Error showing toast:', error);
    }
}

function hideToast(toastId) {
    try {
        const toast = document.getElementById(toastId);
        if (toast) {
            toast.style.display = 'none';
        }
    } catch (error) {
        console.error('Error hiding toast:', error);
    }
}

// Loading Overlay
function showLoading(show) {
    try {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.style.display = show ? 'flex' : 'none';
        }
    } catch (error) {
        console.error('Error toggling loading overlay:', error);
    }
}



// Admin Functions
function clearAllFiles() {
    if (!isAdmin) {
        showError('Admin access required');
        return;
    }
    
    if (!confirm('Are you sure you want to delete ALL uploaded files? This action cannot be undone.')) {
        return;
    }
    
    try {
        // Clear all uploaded PDFs
        samplePDFs.length = 0;
        localStorage.removeItem('uploadedPDFs');
        if (window.sessionPDFs) {
            window.sessionPDFs.length = 0;
        }
        
        // Reload the files display
        loadPDFs();
        showSuccess('All files have been cleared successfully!');
        
    } catch (error) {
        console.error('Error clearing files:', error);
        showError('Failed to clear files: ' + error.message);
    }
}

function exportFilesList() {
    if (!isAdmin) {
        showError('Admin access required');
        return;
    }
    
    try {
        const filesList = samplePDFs.map(pdf => ({
            filename: pdf.filename,
            category: pdf.category,
            upload_date: pdf.upload_date,
            size: formatFileSize(pdf.size),
            downloads: pdf.download_count
        }));
        
        const dataStr = JSON.stringify(filesList, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = 'files_list_' + new Date().toISOString().split('T')[0] + '.json';
        link.click();
        
        showSuccess('Files list exported successfully!');
        
    } catch (error) {
        console.error('Error exporting files list:', error);
        showError('Failed to export files list');
    }
}

// Event Listeners for modal close on outside click
document.addEventListener('click', function(event) {
    // Close modals when clicking outside
    if (event.target.classList.contains('modal-overlay')) {
        if (event.target.id === 'forgotPasswordModal') {
            closeForgotPassword();
        }
    }
});

// Keyboard shortcuts
document.addEventListener('keydown', function(event) {
    // Escape key to close modals
    if (event.key === 'Escape') {
        closeForgotPassword();
    }
});

// Initialize search functionality
document.addEventListener('input', function(event) {
    if (event.target.id === 'searchInput') {
        searchPDFs();
    }
});

// Handle storage quota exceeded errors
window.addEventListener('error', function(event) {
    if (event.message && event.message.includes('QuotaExceededError')) {
        console.error('Storage quota exceeded');
        showError('Storage is full. Please clear some files.');
    }
});

// Handle before unload to clean up
window.addEventListener('beforeunload', function() {
    try {
        cleanupOldFileData();
    } catch (error) {
        console.error('Error during cleanup:', error);
    }
});
