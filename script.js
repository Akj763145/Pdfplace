// PDF Place - Enhanced JavaScript Application
// Author: AYUSH KUMAR
// Contact: 7673085672, AK7631459148@gmail.com

// Application State Management
class PDFPlaceApp {
  constructor() {
    this.currentUser = null;
    this.isLoggedIn = false;
    this.isAdmin = false;
    this.files = [];
    this.downloads = [];
    this.comments = [];
    this.currentTab = 'files';
    this.storageUsed = 0;
    this.maxStorage = 2 * 1024 * 1024 * 1024; // 2GB in bytes
    this.maxFileSize = 100 * 1024 * 1024; // 100MB in bytes
    
    this.init();
  }

  init() {
    this.loadFromStorage();
    this.setupEventListeners();
    this.updateUI();
    this.loadSampleData();
  }

  // Load data from localStorage
  loadFromStorage() {
    try {
      const savedFiles = localStorage.getItem('pdfplace_files');
      const savedDownloads = localStorage.getItem('pdfplace_downloads');
      const savedComments = localStorage.getItem('pdfplace_comments');
      const savedUser = localStorage.getItem('pdfplace_user');
      const savedStorageUsed = localStorage.getItem('pdfplace_storage_used');

      if (savedFiles) this.files = JSON.parse(savedFiles);
      if (savedDownloads) this.downloads = JSON.parse(savedDownloads);
      if (savedComments) this.comments = JSON.parse(savedComments);
      if (savedStorageUsed) this.storageUsed = parseInt(savedStorageUsed);
      
      if (savedUser) {
        const user = JSON.parse(savedUser);
        this.currentUser = user.email;
        this.isLoggedIn = true;
        this.isAdmin = user.isAdmin || false;
      }
    } catch (error) {
      console.error('Error loading from storage:', error);
      this.showToast('Error loading saved data', 'error');
    }
  }

  // Save data to localStorage
  saveToStorage() {
    try {
      localStorage.setItem('pdfplace_files', JSON.stringify(this.files));
      localStorage.setItem('pdfplace_downloads', JSON.stringify(this.downloads));
      localStorage.setItem('pdfplace_comments', JSON.stringify(this.comments));
      localStorage.setItem('pdfplace_storage_used', this.storageUsed.toString());
      
      if (this.isLoggedIn) {
        localStorage.setItem('pdfplace_user', JSON.stringify({
          email: this.currentUser,
          isAdmin: this.isAdmin
        }));
      }
    } catch (error) {
      console.error('Error saving to storage:', error);
      this.showToast('Error saving data', 'error');
    }
  }

  // Setup event listeners
  setupEventListeners() {
    // Search functionality
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
      searchInput.addEventListener('input', this.debounce(() => this.searchPDFs(), 300));
    }

    // Category filter
    const categoryFilter = document.getElementById('categoryFilter');
    if (categoryFilter) {
      categoryFilter.addEventListener('change', () => this.filterByCategory());
    }

    // Downloads filter
    const downloadsFilter = document.getElementById('downloadsFilter');
    if (downloadsFilter) {
      downloadsFilter.addEventListener('change', () => this.filterDownloads());
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'f':
            e.preventDefault();
            searchInput?.focus();
            break;
          case '1':
            e.preventDefault();
            this.showTab('files');
            break;
          case '2':
            e.preventDefault();
            this.showTab('downloads');
            break;
          case '3':
            e.preventDefault();
            this.showTab('comments');
            break;
          case '4':
            e.preventDefault();
            this.showTab('about');
            break;
        }
      }
    });

    // Auto-save on visibility change
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.saveToStorage();
      }
    });

    // Auto-save on beforeunload
    window.addEventListener('beforeunload', () => {
      this.saveToStorage();
    });
  }

  // Debounce utility function
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // Authentication methods
  login(email, password) {
    if (!email || !password) {
      this.showToast('Please enter both email and password', 'error');
      return false;
    }

    if (!this.isValidEmail(email)) {
      this.showToast('Please enter a valid email address', 'error');
      return false;
    }

    // Simple demo authentication
    this.currentUser = email;
    this.isLoggedIn = true;
    this.isAdmin = email.toLowerCase().includes('admin') || email.toLowerCase().includes('ayush');
    
    this.saveToStorage();
    this.updateUI();
    this.showToast(`Welcome ${email}!`, 'success');
    
    return true;
  }

  logout() {
    this.currentUser = null;
    this.isLoggedIn = false;
    this.isAdmin = false;
    
    localStorage.removeItem('pdfplace_user');
    this.updateUI();
    this.showToast('Logged out successfully', 'success');
  }

  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // UI Update methods
  updateUI() {
    const loginSection = document.getElementById('loginSection');
    const mainApp = document.getElementById('mainApp');
    const userInfo = document.getElementById('userInfo');
    const currentUser = document.getElementById('currentUser');
    const uploadSection = document.getElementById('uploadSection');
    const adminControls = document.getElementById('adminControls');
    const storageInfo = document.getElementById('storageInfo');

    if (this.isLoggedIn) {
      loginSection.style.display = 'none';
      mainApp.style.display = 'block';
      userInfo.style.display = 'flex';
      currentUser.textContent = `Welcome, ${this.currentUser}`;
      
      if (this.isAdmin) {
        uploadSection.style.display = 'block';
        adminControls.style.display = 'block';
        storageInfo.style.display = 'block';
      } else {
        uploadSection.style.display = 'none';
        adminControls.style.display = 'none';
        storageInfo.style.display = 'none';
      }
    } else {
      loginSection.style.display = 'flex';
      mainApp.style.display = 'none';
      userInfo.style.display = 'none';
    }

    this.updateStorageInfo();
    this.renderFiles();
    this.renderDownloads();
    this.renderComments();
  }

  // Tab management
  showTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    document.querySelector(`[onclick="showTab('${tabName}')"]`)?.classList.add('active');

    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
      content.classList.remove('active');
    });
    document.getElementById(`${tabName}Tab`)?.classList.add('active');

    this.currentTab = tabName;
    
    // Update URL hash without triggering page reload
    history.replaceState(null, null, `#${tabName}`);
  }

  // File management methods
  uploadPDF(event) {
    event.preventDefault();
    
    if (!this.isAdmin) {
      this.showToast('Only administrators can upload files', 'error');
      return;
    }

    const fileInput = document.getElementById('pdfFile');
    const categorySelect = document.getElementById('categorySelect');
    const file = fileInput.files[0];
    const category = categorySelect.value;

    if (!file || !category) {
      this.showToast('Please select a file and category', 'error');
      return;
    }

    if (file.type !== 'application/pdf') {
      this.showToast('Please select a PDF file only', 'error');
      return;
    }

    if (file.size > this.maxFileSize) {
      this.showToast(`File size exceeds ${this.formatFileSize(this.maxFileSize)} limit`, 'error');
      return;
    }

    if (this.storageUsed + file.size > this.maxStorage) {
      this.showToast('Storage limit exceeded', 'error');
      return;
    }

    this.showLoading(true);

    // Simulate file upload process
    setTimeout(() => {
      const fileData = {
        id: this.generateId(),
        name: file.name,
        size: file.size,
        category: category,
        uploadDate: new Date().toISOString(),
        uploadedBy: this.currentUser,
        downloads: 0,
        url: URL.createObjectURL(file) // In real app, this would be server URL
      };

      this.files.push(fileData);
      this.storageUsed += file.size;
      this.saveToStorage();
      this.updateUI();

      // Reset form
      fileInput.value = '';
      categorySelect.value = '';

      this.showLoading(false);
      this.showToast('File uploaded successfully!', 'success');
    }, 1500);
  }

  deletePDF(fileId) {
    if (!this.isAdmin) {
      this.showToast('Only administrators can delete files', 'error');
      return;
    }

    if (!confirm('Are you sure you want to delete this file?')) {
      return;
    }

    const fileIndex = this.files.findIndex(f => f.id === fileId);
    if (fileIndex !== -1) {
      const file = this.files[fileIndex];
      this.storageUsed -= file.size;
      this.files.splice(fileIndex, 1);
      
      // Revoke object URL to free memory
      if (file.url && file.url.startsWith('blob:')) {
        URL.revokeObjectURL(file.url);
      }
      
      this.saveToStorage();
      this.updateUI();
      this.showToast('File deleted successfully', 'success');
    }
  }

  downloadPDF(fileId) {
    const file = this.files.find(f => f.id === fileId);
    if (!file) {
      this.showToast('File not found', 'error');
      return;
    }

    // Create download record
    const downloadRecord = {
      id: this.generateId(),
      fileId: fileId,
      fileName: file.name,
      category: file.category,
      downloadDate: new Date().toISOString(),
      downloadedBy: this.currentUser || 'Anonymous',
      fileSize: file.size
    };

    this.downloads.unshift(downloadRecord);
    
    // Update file download count
    file.downloads = (file.downloads || 0) + 1;
    
    this.saveToStorage();
    this.renderDownloads();
    this.renderFiles();

    // Simulate download
    const link = document.createElement('a');
    link.href = file.url;
    link.download = file.name;
    link.click();

    this.showToast('Download started', 'success');
  }

  previewPDF(fileId) {
    const file = this.files.find(f => f.id === fileId);
    if (!file) {
      this.showToast('File not found', 'error');
      return;
    }

    // Open PDF in new tab for preview
    window.open(file.url, '_blank');
  }

  // Search and filter methods
  searchPDFs() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const filteredFiles = this.files.filter(file => 
      file.name.toLowerCase().includes(searchTerm) ||
      file.category.toLowerCase().includes(searchTerm)
    );
    this.renderFiles(filteredFiles);
  }

  filterByCategory() {
    const category = document.getElementById('categoryFilter').value;
    const filteredFiles = category ? 
      this.files.filter(file => file.category === category) : 
      this.files;
    this.renderFiles(filteredFiles);
  }

  filterDownloads() {
    const filter = document.getElementById('downloadsFilter').value;
    const now = new Date();
    let filteredDownloads = this.downloads;

    switch (filter) {
      case 'today':
        filteredDownloads = this.downloads.filter(d => {
          const downloadDate = new Date(d.downloadDate);
          return downloadDate.toDateString() === now.toDateString();
        });
        break;
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        filteredDownloads = this.downloads.filter(d => 
          new Date(d.downloadDate) >= weekAgo
        );
        break;
      case 'month':
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        filteredDownloads = this.downloads.filter(d => 
          new Date(d.downloadDate) >= monthAgo
        );
        break;
    }

    this.renderDownloads(filteredDownloads);
  }

  // Render methods
  renderFiles(filesToRender = null) {
    const pdfList = document.getElementById('pdfList');
    const files = filesToRender || this.files;

    if (files.length === 0) {
      pdfList.innerHTML = `
        <div class="empty-state">
          <p>📂 No files found</p>
          <p>Upload some PDFs to get started!</p>
        </div>
      `;
      return;
    }

    pdfList.innerHTML = files.map(file => `
      <div class="pdf-item" data-category="${file.category}">
        <div class="pdf-info">
          <div class="pdf-icon">📄</div>
          <div class="pdf-details">
            <div class="pdf-title">${this.escapeHtml(file.name)}</div>
            <div class="pdf-meta">
              <span>📁 ${this.getCategoryName(file.category)}</span>
              <span>📊 ${this.formatFileSize(file.size)}</span>
              <span>📅 ${this.formatDate(file.uploadDate)}</span>
              <span>📥 ${file.downloads || 0} downloads</span>
              ${this.isAdmin ? `<span>👤 ${file.uploadedBy}</span>` : ''}
            </div>
          </div>
        </div>
        <div class="pdf-actions">
          <button class="action-btn preview-btn" onclick="app.previewPDF('${file.id}')" title="Preview PDF">
            👁️ Preview
          </button>
          <button class="action-btn download-btn" onclick="app.downloadPDF('${file.id}')" title="Download PDF">
            📥 Download
          </button>
          ${this.isAdmin ? `
            <button class="action-btn delete-btn" onclick="app.deletePDF('${file.id}')" title="Delete PDF">
              🗑️ Delete
            </button>
          ` : ''}
        </div>
      </div>
    `).join('');
  }

  renderDownloads(downloadsToRender = null) {
    const downloadsList = document.getElementById('downloadsList');
    const downloads = downloadsToRender || this.downloads;

    if (downloads.length === 0) {
      downloadsList.innerHTML = `
        <div class="empty-state">
          <p>📥 No downloads yet</p>
          <p>Download some files to see your history here!</p>
        </div>
      `;
      return;
    }

    downloadsList.innerHTML = downloads.map(download => `
      <div class="download-item">
        <div class="download-info">
          <div class="download-icon">📥</div>
          <div class="download-details">
            <div class="download-title">${this.escapeHtml(download.fileName)}</div>
            <div class="download-meta">
              <span>📁 ${this.getCategoryName(download.category)}</span>
              <span>📊 ${this.formatFileSize(download.fileSize)}</span>
              <span>📅 ${this.formatDate(download.downloadDate)}</span>
              <span>👤 ${download.downloadedBy}</span>
            </div>
          </div>
        </div>
        <div class="download-actions">
          <button class="action-btn download-again-btn" onclick="app.downloadPDF('${download.fileId}')" title="Download Again">
            🔄 Download Again
          </button>
        </div>
      </div>
    `).join('');
  }

  renderComments(commentsToRender = null) {
    const commentsList = document.getElementById('commentsList');
    const comments = commentsToRender || this.comments;

    if (comments.length === 0) {
      commentsList.innerHTML = `
        <div class="empty-state">
          <p>💬 No feedback yet</p>
          <p>Be the first to share your thoughts!</p>
        </div>
      `;
      return;
    }

    commentsList.innerHTML = comments.map(comment => `
      <div class="comment-item" data-status="${comment.status || 'pending'}">
        <div class="comment-header">
          <div class="comment-type">
            <span class="comment-icon">${this.getCommentIcon(comment.category)}</span>
            <span class="comment-category">${comment.category}</span>
          </div>
          <div class="comment-meta">
            <span>📅 ${this.formatDate(comment.date)}</span>
            <span>👤 ${comment.author}</span>
            <span class="status-badge status-${comment.status || 'pending'}">${comment.status || 'pending'}</span>
          </div>
        </div>
        <div class="comment-text">${this.escapeHtml(comment.text)}</div>
        ${this.isAdmin ? `
          <div class="comment-actions">
            <button class="status-btn reviewed-btn" onclick="app.updateCommentStatus('${comment.id}', 'reviewed')" title="Mark as Reviewed">
              ✅ Reviewed
            </button>
            <button class="status-btn resolved-btn" onclick="app.updateCommentStatus('${comment.id}', 'resolved')" title="Mark as Resolved">
              ✔️ Resolved
            </button>
            <button class="status-btn delete-btn" onclick="app.deleteComment('${comment.id}')" title="Delete Comment">
              🗑️ Delete
            </button>
          </div>
        ` : ''}
      </div>
    `).join('');
  }

  // Comment management
  submitComment(event) {
    event.preventDefault();
    
    const categorySelect = document.getElementById('commentCategory');
    const textArea = document.getElementById('commentText');
    const category = categorySelect.value;
    const text = textArea.value.trim();

    if (!text) {
      this.showToast('Please enter your feedback', 'error');
      return;
    }

    const comment = {
      id: this.generateId(),
      category: category,
      text: text,
      author: this.currentUser || 'Anonymous',
      date: new Date().toISOString(),
      status: 'pending'
    };

    this.comments.unshift(comment);
    this.saveToStorage();
    this.renderComments();

    // Reset form
    textArea.value = '';
    categorySelect.value = 'suggestion';

    this.showToast('Feedback submitted successfully!', 'success');
  }

  updateCommentStatus(commentId, status) {
    if (!this.isAdmin) {
      this.showToast('Only administrators can update comment status', 'error');
      return;
    }

    const comment = this.comments.find(c => c.id === commentId);
    if (comment) {
      comment.status = status;
      this.saveToStorage();
      this.renderComments();
      this.showToast(`Comment marked as ${status}`, 'success');
    }
  }

  deleteComment(commentId) {
    if (!this.isAdmin) {
      this.showToast('Only administrators can delete comments', 'error');
      return;
    }

    if (!confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    const commentIndex = this.comments.findIndex(c => c.id === commentId);
    if (commentIndex !== -1) {
      this.comments.splice(commentIndex, 1);
      this.saveToStorage();
      this.renderComments();
      this.showToast('Comment deleted successfully', 'success');
    }
  }

  // Admin functions
  clearAllFiles() {
    if (!this.isAdmin) {
      this.showToast('Only administrators can clear all files', 'error');
      return;
    }

    if (!confirm('Are you sure you want to delete ALL files? This action cannot be undone!')) {
      return;
    }

    // Revoke all object URLs
    this.files.forEach(file => {
      if (file.url && file.url.startsWith('blob:')) {
        URL.revokeObjectURL(file.url);
      }
    });

    this.files = [];
    this.storageUsed = 0;
    this.saveToStorage();
    this.updateUI();
    this.showToast('All files cleared successfully', 'success');
  }

  exportFilesList() {
    if (!this.isAdmin) {
      this.showToast('Only administrators can export files list', 'error');
      return;
    }

    const exportData = {
      exportDate: new Date().toISOString(),
      totalFiles: this.files.length,
      totalStorage: this.formatFileSize(this.storageUsed),
      files: this.files.map(file => ({
        name: file.name,
        category: this.getCategoryName(file.category),
        size: this.formatFileSize(file.size),
        uploadDate: this.formatDate(file.uploadDate),
        downloads: file.downloads || 0,
        uploadedBy: file.uploadedBy
      }))
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `pdfplace-files-export-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);

    this.showToast('Files list exported successfully', 'success');
  }

  clearDownloadHistory() {
    if (!confirm('Are you sure you want to clear download history?')) {
      return;
    }

    this.downloads = [];
    this.saveToStorage();
    this.renderDownloads();
    this.showToast('Download history cleared', 'success');
  }

  // Storage management
  updateStorageInfo() {
    const storageUsedElement = document.getElementById('storageUsed');
    const storagePercentElement = document.getElementById('storagePercent');
    const storageProgressElement = document.getElementById('storageProgress');

    if (storageUsedElement && storagePercentElement && storageProgressElement) {
      const usedMB = this.formatFileSize(this.storageUsed);
      const percentage = Math.round((this.storageUsed / this.maxStorage) * 100);

      storageUsedElement.textContent = usedMB;
      storagePercentElement.textContent = `${percentage}%`;
      storageProgressElement.style.width = `${percentage}%`;

      // Update progress bar color based on usage
      storageProgressElement.className = 'storage-progress';
      if (percentage >= 90) {
        storageProgressElement.classList.add('critical');
      } else if (percentage >= 70) {
        storageProgressElement.classList.add('warning');
      }
    }
  }

  // Utility methods
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  getCategoryName(category) {
    const categories = {
      'ncert': 'NCERT Books',
      'pyqs': 'Previous Year Questions',
      'mocktest': 'Mock Tests',
      'pw-notes': 'Physics Wallah Notes',
      'kgs-notes': 'KGS Notes',
      'others': 'Others'
    };
    return categories[category] || category;
  }

  getCommentIcon(category) {
    const icons = {
      'suggestion': '💡',
      'bug': '🐛',
      'feature': '✨',
      'general': '💬'
    };
    return icons[category] || '💬';
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // UI Helper methods
  showLoading(show) {
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) {
      loadingOverlay.style.display = show ? 'flex' : 'none';
    }
  }

  showToast(message, type = 'info') {
    const toastId = type === 'error' ? 'errorToast' : 'successToast';
    const messageId = type === 'error' ? 'errorMessage' : 'successMessage';
    
    const toast = document.getElementById(toastId);
    const messageElement = document.getElementById(messageId);
    
    if (toast && messageElement) {
      messageElement.textContent = message;
      toast.style.display = 'block';
      
      // Auto-hide after 5 seconds
      setTimeout(() => {
        this.hideToast(toastId);
      }, 5000);
    }
  }

  hideToast(toastId) {
    const toast = document.getElementById(toastId);
    if (toast) {
      toast.style.display = 'none';
    }
  }

  // Sample data for demonstration
  loadSampleData() {
    if (this.files.length === 0) {
      const sampleFiles = [
        {
          id: this.generateId(),
          name: 'NCERT Class 12 Physics.pdf',
          size: 15 * 1024 * 1024, // 15MB
          category: 'ncert',
          uploadDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          uploadedBy: 'admin@pdfplace.com',
          downloads: 45,
          url: '#sample-file-1'
        },
        {
          id: this.generateId(),
          name: 'JEE Main 2023 Question Paper.pdf',
          size: 8 * 1024 * 1024, // 8MB
          category: 'pyqs',
          uploadDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          uploadedBy: 'admin@pdfplace.com',
          downloads: 32,
          url: '#sample-file-2'
        },
        {
          id: this.generateId(),
          name: 'Physics Wallah Organic Chemistry Notes.pdf',
          size: 12 * 1024 * 1024, // 12MB
          category: 'pw-notes',
          uploadDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          uploadedBy: 'admin@pdfplace.com',
          downloads: 28,
          url: '#sample-file-3'
        }
      ];

      this.files = sampleFiles;
      this.storageUsed = sampleFiles.reduce((total, file) => total + file.size, 0);
    }

    if (this.comments.length === 0) {
      const sampleComments = [
        {
          id: this.generateId(),
          category: 'suggestion',
          text: 'It would be great to have a dark mode toggle for better viewing experience.',
          author: 'student@example.com',
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'pending'
        },
        {
          id: this.generateId(),
          category: 'feature',
          text: 'Please add more NCERT books for different classes and subjects.',
          author: 'teacher@example.com',
          date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'reviewed'
        }
      ];

      this.comments = sampleComments;
    }

    this.saveToStorage();
  }
}

// Global functions for HTML onclick handlers
let app;

function login(event) {
  event.preventDefault();
  const email = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  
  if (app.login(email, password)) {
    document.getElementById('loginSection').style.display = 'none';
    document.getElementById('mainApp').style.display = 'block';
  }
}

function logout() {
  app.logout();
}

function showLoginSection() {
  document.getElementById('loginSection').style.display = 'flex';
  document.getElementById('mainApp').style.display = 'none';
}

function showTab(tabName) {
  app.showTab(tabName);
}

function uploadPDF(event) {
  app.uploadPDF(event);
}

function searchPDFs() {
  app.searchPDFs();
}

function filterByCategory() {
  app.filterByCategory();
}

function filterDownloads() {
  app.filterDownloads();
}

function submitComment(event) {
  app.submitComment(event);
}

function clearAllFiles() {
  app.clearAllFiles();
}

function exportFilesList() {
  app.exportFilesList();
}

function clearDownloadHistory() {
  app.clearDownloadHistory();
}

function togglePasswordVisibility() {
  const passwordInput = document.getElementById('password');
  const toggleIcon = document.getElementById('passwordToggleIcon');
  
  if (passwordInput.type === 'password') {
    passwordInput.type = 'text';
    toggleIcon.textContent = '🙈';
  } else {
    passwordInput.type = 'password';
    toggleIcon.textContent = '👁️';
  }
}

function showForgotPassword() {
  document.getElementById('forgotPasswordModal').style.display = 'flex';
}

function closeForgotPassword() {
  document.getElementById('forgotPasswordModal').style.display = 'none';
}

function sendPasswordReset() {
  const email = document.getElementById('resetEmail').value;
  if (!email) {
    app.showToast('Please enter your email address', 'error');
    return;
  }
  
  if (!app.isValidEmail(email)) {
    app.showToast('Please enter a valid email address', 'error');
    return;
  }
  
  app.showToast('Password reset link sent to your email!', 'success');
  closeForgotPassword();
  document.getElementById('resetEmail').value = '';
}

function hideToast(toastId) {
  app.hideToast(toastId);
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  app = new PDFPlaceApp();
  
  // Handle URL hash for direct tab access
  const hash = window.location.hash.substring(1);
  if (hash && ['files', 'downloads', 'comments', 'about'].includes(hash)) {
    app.showTab(hash);
  }
  
  // Handle browser back/forward buttons
  window.addEventListener('popstate', function() {
    const hash = window.location.hash.substring(1);
    if (hash && ['files', 'downloads', 'comments', 'about'].includes(hash)) {
      app.showTab(hash);
    }
  });
});

// Service Worker registration for offline functionality (optional)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('/sw.js')
      .then(function(registration) {
        console.log('ServiceWorker registration successful');
      })
      .catch(function(err) {
        console.log('ServiceWorker registration failed');
      });
  });
}