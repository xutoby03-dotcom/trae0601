const STORAGE_KEYS = {
    ELEVATORS: 'elevator_maintenance_elevators',
    ANNOUNCEMENTS: 'elevator_maintenance_announcements',
    READ_RECORDS: 'elevator_maintenance_read_records',
    NOTIFIED: 'elevator_maintenance_notified',
    RESIDENT_REMINDERS: 'elevator_maintenance_resident_reminders'
};

const Utils = {
    uid() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
    },

    formatDateTime(date) {
        if (!date) return '-';
        const d = new Date(date);
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const h = String(d.getHours()).padStart(2, '0');
        const min = String(d.getMinutes()).padStart(2, '0');
        return `${y}-${m}-${day} ${h}:${min}`;
    },

    formatDate(date) {
        if (!date) return '-';
        const d = new Date(date);
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
    },

    toInputDateTime(date) {
        if (!date) return '';
        const d = new Date(date);
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const h = String(d.getHours()).padStart(2, '0');
        const min = String(d.getMinutes()).padStart(2, '0');
        return `${y}-${m}-${day}T${h}:${min}`;
    },

    diffMinutes(start, end) {
        return Math.max(0, Math.round((new Date(end) - new Date(start)) / 60000));
    },

    formatDuration(minutes) {
        if (minutes < 60) return `${minutes}分钟`;
        const h = Math.floor(minutes / 60);
        const m = minutes % 60;
        return m > 0 ? `${h}小时${m}分钟` : `${h}小时`;
    },

    isSameMonth(date1, date2) {
        const d1 = new Date(date1);
        const d2 = new Date(date2);
        return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth();
    },

    escapeHtml(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }
};

const Storage = {
    get(key, defaultValue) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : defaultValue;
        } catch (e) {
            return defaultValue;
        }
    },

    set(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    }
};

const ElevatorStore = {
    all() {
        return Storage.get(STORAGE_KEYS.ELEVATORS, []);
    },

    find(id) {
        return this.all().find(e => e.id === id);
    },

    create(data) {
        const elevators = this.all();
        const elevator = { id: Utils.uid(), createdAt: Date.now(), ...data };
        elevators.push(elevator);
        Storage.set(STORAGE_KEYS.ELEVATORS, elevators);
        return elevator;
    },

    update(id, data) {
        const elevators = this.all();
        const idx = elevators.findIndex(e => e.id === id);
        if (idx >= 0) {
            elevators[idx] = { ...elevators[idx], ...data };
            Storage.set(STORAGE_KEYS.ELEVATORS, elevators);
            return elevators[idx];
        }
        return null;
    },

    remove(id) {
        const elevators = this.all().filter(e => e.id !== id);
        Storage.set(STORAGE_KEYS.ELEVATORS, elevators);
    },

    getBuildings() {
        return [...new Set(this.all().map(e => e.building))].filter(Boolean).sort();
    }
};

const AnnouncementStore = {
    all() {
        return Storage.get(STORAGE_KEYS.ANNOUNCEMENTS, []);
    },

    find(id) {
        return this.all().find(a => a.id === id);
    },

    create(data) {
        const announcements = this.all();
        const announcement = {
            id: Utils.uid(),
            createdAt: Date.now(),
            status: 'upcoming',
            readBy: [],
            complaints: 0,
            overdueReason: '',
            actualResumeTime: null,
            ...data
        };
        announcements.push(announcement);
        Storage.set(STORAGE_KEYS.ANNOUNCEMENTS, announcements);
        return announcement;
    },

    update(id, data) {
        const announcements = this.all();
        const idx = announcements.findIndex(a => a.id === id);
        if (idx >= 0) {
            announcements[idx] = { ...announcements[idx], ...data };
            Storage.set(STORAGE_KEYS.ANNOUNCEMENTS, announcements);
            return announcements[idx];
        }
        return null;
    },

    remove(id) {
        const announcements = this.all().filter(a => a.id !== id);
        Storage.set(STORAGE_KEYS.ANNOUNCEMENTS, announcements);
    },

    markAsRead(id, userId = 'current_user') {
        const announcements = this.all();
        const idx = announcements.findIndex(a => a.id === id);
        if (idx >= 0 && !announcements[idx].readBy.includes(userId)) {
            announcements[idx].readBy.push(userId);
            Storage.set(STORAGE_KEYS.ANNOUNCEMENTS, announcements);
            return announcements[idx];
        }
        return announcements[idx] || null;
    },

    addComplaint(id) {
        const announcements = this.all();
        const idx = announcements.findIndex(a => a.id === id);
        if (idx >= 0) {
            announcements[idx].complaints = (announcements[idx].complaints || 0) + 1;
            Storage.set(STORAGE_KEYS.ANNOUNCEMENTS, announcements);
            return announcements[idx];
        }
        return null;
    },

    getNotified() {
        return Storage.get(STORAGE_KEYS.NOTIFIED, {});
    },

    setNotified(id, key) {
        const notified = this.getNotified();
        if (!notified[id]) notified[id] = {};
        notified[id][key] = Date.now();
        Storage.set(STORAGE_KEYS.NOTIFIED, notified);
    },

    hasNotified(id, key) {
        const notified = this.getNotified();
        return !!(notified[id] && notified[id][key]);
    }
};

const ResidentReminderStore = {
    all() {
        return Storage.get(STORAGE_KEYS.RESIDENT_REMINDERS, []);
    },

    findByAnnouncementId(announcementId, type) {
        return this.all().find(r => r.announcementId === announcementId && r.type === type);
    },

    create(data) {
        const reminders = this.all();
        const reminder = {
            id: Utils.uid(),
            createdAt: Date.now(),
            dismissed: false,
            resolved: false,
            ...data
        };
        reminders.push(reminder);
        Storage.set(STORAGE_KEYS.RESIDENT_REMINDERS, reminders);
        return reminder;
    },

    update(id, data) {
        const reminders = this.all();
        const idx = reminders.findIndex(r => r.id === id);
        if (idx >= 0) {
            reminders[idx] = { ...reminders[idx], ...data };
            Storage.set(STORAGE_KEYS.RESIDENT_REMINDERS, reminders);
            return reminders[idx];
        }
        return null;
    },

    updateByAnnouncement(announcementId, type, data) {
        const reminders = this.all();
        const idx = reminders.findIndex(r => r.announcementId === announcementId && r.type === type);
        if (idx >= 0) {
            reminders[idx] = { ...reminders[idx], ...data };
            Storage.set(STORAGE_KEYS.RESIDENT_REMINDERS, reminders);
            return reminders[idx];
        }
        return null;
    },

    refreshSnapshot(announcementId, type) {
        const reminders = this.all();
        const idx = reminders.findIndex(r => r.announcementId === announcementId && r.type === type);
        if (idx < 0) return null;
        const announcement = AnnouncementStore.find(announcementId);
        if (!announcement) return null;
        const readCount = (announcement.readBy || []).length;
        const total = announcement.totalResidents || 0;
        const unreadCount = Math.max(0, total - readCount);
        reminders[idx].snapshotReadCount = readCount;
        reminders[idx].snapshotUnreadCount = unreadCount;
        reminders[idx].snapshotTotal = total;
        reminders[idx].snapshotAt = Date.now();
        Storage.set(STORAGE_KEYS.RESIDENT_REMINDERS, reminders);
        return reminders[idx];
    },

    getActive() {
        return this.all()
            .filter(r => !r.dismissed)
            .sort((a, b) => b.createdAt - a.createdAt);
    },

    dismiss(id) {
        this.update(id, { dismissed: true });
    },

    remove(id) {
        const reminders = this.all().filter(r => r.id !== id);
        Storage.set(STORAGE_KEYS.RESIDENT_REMINDERS, reminders);
    },

    clearAll() {
        Storage.set(STORAGE_KEYS.RESIDENT_REMINDERS, []);
    }
};

const Notification = {
    show(title, message, type = 'info', duration = 5000) {
        const container = document.getElementById('notification-container');
        const el = document.createElement('div');
        el.className = `notification ${type}`;
        el.innerHTML = `
            <div class="notification-title">${Utils.escapeHtml(title)}</div>
            <div class="notification-msg">${Utils.escapeHtml(message)}</div>
        `;
        container.appendChild(el);
        setTimeout(() => {
            el.style.opacity = '0';
            el.style.transform = 'translateX(40px)';
            el.style.transition = 'all 0.3s';
            setTimeout(() => el.remove(), 300);
        }, duration);
    }
};

const StatusHelper = {
    computeStatus(announcement) {
        if (announcement.status === 'completed' || announcement.actualResumeTime) {
            return 'completed';
        }
        const now = Date.now();
        const start = new Date(announcement.startTime).getTime();
        const expected = new Date(announcement.expectedResumeTime).getTime();

        if (now < start) return 'upcoming';
        if (now > expected) return 'overdue';
        return 'ongoing';
    },

    refreshAllStatus() {
        const announcements = AnnouncementStore.all();
        let changed = false;
        announcements.forEach(a => {
            const newStatus = this.computeStatus(a);
            if (newStatus !== a.status) {
                a.status = newStatus;
                changed = true;
            }
        });
        if (changed) {
            Storage.set(STORAGE_KEYS.ANNOUNCEMENTS, announcements);
        }
        return announcements;
    },

    getStatusLabel(status) {
        const map = {
            upcoming: '即将停梯',
            ongoing: '停梯中',
            overdue: '超时未恢复',
            completed: '已恢复'
        };
        return map[status] || status;
    }
};

const Modal = {
    el() { return document.getElementById('modal'); },
    titleEl() { return document.getElementById('modal-title'); },
    bodyEl() { return document.getElementById('modal-body'); },

    open(title, bodyHtml) {
        this.titleEl().textContent = title;
        this.bodyEl().innerHTML = bodyHtml;
        this.el().classList.add('active');
    },

    close() {
        this.el().classList.remove('active');
    }
};

const ElevatorUI = {
    render(searchKeyword = '') {
        const grid = document.getElementById('elevator-grid');
        let elevators = ElevatorStore.all();

        if (searchKeyword) {
            const kw = searchKeyword.toLowerCase();
            elevators = elevators.filter(e =>
                (e.building || '').toLowerCase().includes(kw) ||
                (e.unit || '').toLowerCase().includes(kw) ||
                (e.elevatorNo || '').toLowerCase().includes(kw) ||
                (e.maintenanceCompany || '').toLowerCase().includes(kw) ||
                (e.propertyCompany || '').toLowerCase().includes(kw)
            );
        }

        if (elevators.length === 0) {
            grid.innerHTML = `<div class="empty-state">${searchKeyword ? '未找到匹配的电梯' : '暂无电梯档案，请先添加'}</div>`;
            return;
        }

        grid.innerHTML = elevators.map(e => this.renderCard(e)).join('');
        this.bindEvents();
    },

    renderCard(e) {
        const photoHtml = e.photo
            ? `<img src="${e.photo}" alt="电梯照片">`
            : '🛗';

        return `
            <div class="elevator-card" data-id="${e.id}">
                <div class="elevator-photo">${photoHtml}</div>
                <div class="elevator-body">
                    <div class="elevator-name">${Utils.escapeHtml(e.building)}栋 ${Utils.escapeHtml(e.unit)}单元 ${Utils.escapeHtml(e.elevatorNo)}号梯</div>
                    <div class="elevator-details">
                        <div class="elevator-detail-item">
                            <span class="label">维保公司</span>
                            <span class="value">${Utils.escapeHtml(e.maintenanceCompany || '-')}</span>
                        </div>
                        <div class="elevator-detail-item">
                            <span class="label">责任物业</span>
                            <span class="value">${Utils.escapeHtml(e.propertyCompany || '-')}</span>
                        </div>
                        <div class="elevator-detail-item">
                            <span class="label">上次检修</span>
                            <span class="value">${Utils.formatDate(e.lastInspectionDate)}</span>
                        </div>
                    </div>
                    <div class="elevator-actions">
                        <button class="btn btn-primary btn-sm" data-action="announce" data-id="${e.id}">发公告</button>
                        <button class="btn btn-secondary btn-sm" data-action="edit" data-id="${e.id}">编辑</button>
                        <button class="btn btn-danger btn-sm" data-action="delete" data-id="${e.id}">删除</button>
                    </div>
                </div>
            </div>
        `;
    },

    bindEvents() {
        document.querySelectorAll('#elevator-grid [data-action]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const action = btn.dataset.action;
                const id = btn.dataset.id;
                if (action === 'edit') this.showForm(id);
                else if (action === 'delete') this.confirmDelete(id);
                else if (action === 'announce') AnnouncementUI.showForm(null, id);
            });
        });
    },

    showForm(id = null) {
        const elevator = id ? ElevatorStore.find(id) : null;
        const title = elevator ? '编辑电梯档案' : '添加电梯档案';

        const body = `
            <form id="elevator-form">
                <div class="form-row">
                    <div class="form-group">
                        <label>楼栋 <span class="required">*</span></label>
                        <input type="text" name="building" required value="${Utils.escapeHtml(elevator?.building || '')}" placeholder="如：1、2、3">
                    </div>
                    <div class="form-group">
                        <label>单元 <span class="required">*</span></label>
                        <input type="text" name="unit" required value="${Utils.escapeHtml(elevator?.unit || '')}" placeholder="如：1、2">
                    </div>
                </div>
                <div class="form-group">
                    <label>梯号 <span class="required">*</span></label>
                    <input type="text" name="elevatorNo" required value="${Utils.escapeHtml(elevator?.elevatorNo || '')}" placeholder="如：左、右、1、2">
                </div>
                <div class="form-group">
                    <label>维保公司</label>
                    <input type="text" name="maintenanceCompany" value="${Utils.escapeHtml(elevator?.maintenanceCompany || '')}" placeholder="电梯维保公司名称">
                </div>
                <div class="form-group">
                    <label>责任物业</label>
                    <input type="text" name="propertyCompany" value="${Utils.escapeHtml(elevator?.propertyCompany || '')}" placeholder="物业公司名称">
                </div>
                <div class="form-group">
                    <label>上次检修日期</label>
                    <input type="date" name="lastInspectionDate" value="${elevator?.lastInspectionDate || ''}">
                </div>
                <div class="form-group">
                    <label>电梯照片</label>
                    <label class="photo-upload" for="photo-input">
                        <input type="file" id="photo-input" accept="image/*">
                        <div>📷 点击上传照片</div>
                        <img id="photo-preview" class="photo-preview ${elevator?.photo ? 'show' : ''}" src="${elevator?.photo || ''}" alt="预览">
                    </label>
                </div>
                <input type="hidden" name="photo" id="photo-hidden" value="${elevator?.photo || ''}">
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" data-close="modal">取消</button>
                    <button type="submit" class="btn btn-primary">${elevator ? '保存' : '添加'}</button>
                </div>
            </form>
        `;

        Modal.open(title, body);
        this.bindFormEvents(id);
    },

    bindFormEvents(id) {
        const fileInput = document.getElementById('photo-input');
        const preview = document.getElementById('photo-preview');
        const hidden = document.getElementById('photo-hidden');

        fileInput?.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (ev) => {
                hidden.value = ev.target.result;
                preview.src = ev.target.result;
                preview.classList.add('show');
            };
            reader.readAsDataURL(file);
        });

        document.getElementById('elevator-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            const form = e.target;
            const data = {
                building: form.building.value.trim(),
                unit: form.unit.value.trim(),
                elevatorNo: form.elevatorNo.value.trim(),
                maintenanceCompany: form.maintenanceCompany.value.trim(),
                propertyCompany: form.propertyCompany.value.trim(),
                lastInspectionDate: form.lastInspectionDate.value,
                photo: form.photo.value
            };

            if (id) ElevatorStore.update(id, data);
            else ElevatorStore.create(data);

            Modal.close();
            this.render(document.getElementById('search-elevator').value);
            AnnouncementUI.refreshBuildingFilter();
            DashboardUI.render();
            Notification.show('成功', id ? '电梯档案已更新' : '电梯档案已添加', 'success');
        });
    },

    confirmDelete(id) {
        const elevator = ElevatorStore.find(id);
        if (!elevator) return;

        Modal.open('确认删除', `
            <p>确定要删除 <strong>${Utils.escapeHtml(elevator.building)}栋 ${Utils.escapeHtml(elevator.unit)}单元 ${Utils.escapeHtml(elevator.elevatorNo)}号梯</strong> 的档案吗？</p>
            <p style="color: var(--danger); margin-top: 8px; font-size: 14px;">此操作不可恢复</p>
            <div class="form-actions">
                <button class="btn btn-secondary" data-close="modal">取消</button>
                <button class="btn btn-danger" id="confirm-delete-btn">确认删除</button>
            </div>
        `);

        document.getElementById('confirm-delete-btn')?.addEventListener('click', () => {
            ElevatorStore.remove(id);
            Modal.close();
            this.render(document.getElementById('search-elevator').value);
            AnnouncementUI.refreshBuildingFilter();
            DashboardUI.render();
            Notification.show('已删除', '电梯档案已删除', 'success');
        });
    }
};

const AnnouncementUI = {
    render(statusFilter = '', buildingFilter = '') {
        StatusHelper.refreshAllStatus();
        const list = document.getElementById('announcement-list');
        let announcements = AnnouncementStore.all();

        if (statusFilter) announcements = announcements.filter(a => a.status === statusFilter);
        if (buildingFilter) {
            announcements = announcements.filter(a => {
                const elev = ElevatorStore.find(a.elevatorId);
                return elev && elev.building === buildingFilter;
            });
        }

        announcements.sort((a, b) => new Date(b.startTime) - new Date(a.startTime));

        if (announcements.length === 0) {
            list.innerHTML = `<div class="empty-state">暂无公告</div>`;
            return;
        }

        list.innerHTML = announcements.map(a => this.renderCard(a)).join('');
        this.bindEvents();
    },

    renderCard(a) {
        const elevator = ElevatorStore.find(a.elevatorId);
        const building = elevator ? elevator.building : '-';
        const unit = elevator ? elevator.unit : '-';
        const elevatorNo = elevator ? elevator.elevatorNo : '-';
        const maintenanceCompany = elevator ? elevator.maintenanceCompany : '-';

        const totalResidents = a.totalResidents || 50;
        const readCount = (a.readBy || []).length;
        const readRate = Math.round((readCount / totalResidents) * 100);
        const readProgress = Math.min(100, readRate);

        const statusClass = `status-${a.status}`;
        const overdueSection = a.status === 'overdue' && a.overdueReason
            ? `<div class="overdue-reason">⚠️ 超时原因：${Utils.escapeHtml(a.overdueReason)}</div>`
            : a.status === 'overdue'
            ? `<div class="overdue-reason">⚠️ 已超过预计恢复时间，请及时更新原因</div>`
            : '';

        const now = Date.now();
        const startTime = new Date(a.startTime).getTime();
        const minutesToStart = Math.round((startTime - now) / 60000);

        let countdownInfo = '';
        if (a.status === 'upcoming' && minutesToStart > 0 && minutesToStart <= 60) {
            countdownInfo = `<div style="color: var(--warning); font-size: 13px; font-weight: 500;">⏰ ${minutesToStart}分钟后开始停梯</div>`;
        } else if (a.status === 'overdue') {
            const overdueMinutes = Utils.diffMinutes(a.expectedResumeTime, Date.now());
            countdownInfo = `<div style="color: var(--danger); font-size: 13px; font-weight: 500;">🔴 已超时 ${Utils.formatDuration(overdueMinutes)}</div>`;
        }

        let actualInfo = '';
        if (a.actualResumeTime) {
            const recoveryMinutes = Utils.diffMinutes(a.startTime, a.actualResumeTime);
            actualInfo = `
                <div class="info-item">
                    <span class="info-label">实际恢复时间</span>
                    <span class="info-value">${Utils.formatDateTime(a.actualResumeTime)}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">实际停梯时长</span>
                    <span class="info-value">${Utils.formatDuration(recoveryMinutes)}</span>
                </div>
            `;
        }

        let actions = '';
        if (a.status !== 'completed') {
            actions = `
                <button class="btn btn-success btn-sm" data-action="complete" data-id="${a.id}">标记已恢复</button>
                <button class="btn btn-secondary btn-sm" data-action="read" data-id="${a.id}">我已阅读</button>
                <button class="btn btn-secondary btn-sm" data-action="complaint" data-id="${a.id}">我要投诉 (${a.complaints || 0})</button>
            `;
            if (a.status === 'overdue') {
                actions += `<button class="btn btn-danger btn-sm" data-action="reason" data-id="${a.id}">更新原因</button>`;
            }
            actions += `
                <button class="btn btn-secondary btn-sm" data-action="edit" data-id="${a.id}">编辑</button>
                <button class="btn btn-danger btn-sm" data-action="delete" data-id="${a.id}">删除</button>
            `;
        } else {
            actions = `
                <button class="btn btn-secondary btn-sm" data-action="complaint" data-id="${a.id}">我要投诉 (${a.complaints || 0})</button>
                <button class="btn btn-danger btn-sm" data-action="delete" data-id="${a.id}">删除</button>
            `;
        }

        return `
            <div class="announcement-card ${statusClass}" data-id="${a.id}">
                <div class="announcement-header">
                    <div class="announcement-title">${Utils.escapeHtml(building)}栋 ${Utils.escapeHtml(unit)}单元 ${Utils.escapeHtml(elevatorNo)}号梯 维保通知</div>
                    <span class="status-tag ${a.status}">${StatusHelper.getStatusLabel(a.status)}</span>
                </div>
                ${countdownInfo}
                ${overdueSection}
                <div class="announcement-info">
                    <div class="info-item">
                        <span class="info-label">停梯时间</span>
                        <span class="info-value">${Utils.formatDateTime(a.startTime)}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">预计恢复</span>
                        <span class="info-value">${Utils.formatDateTime(a.expectedResumeTime)}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">影响楼层</span>
                        <span class="info-value">${Utils.escapeHtml(a.affectedFloors || '全部楼层')}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">替代电梯</span>
                        <span class="info-value">${Utils.escapeHtml(a.alternativeElevator || '无')}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">联系电话</span>
                        <span class="info-value">${Utils.escapeHtml(a.contactPhone || '-')}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">维保公司</span>
                        <span class="info-value">${Utils.escapeHtml(maintenanceCompany)}</span>
                    </div>
                    ${actualInfo}
                </div>
                <div style="margin-bottom: 12px;">
                    <span class="paper-notice ${a.paperPosted ? '' : 'no'}">${a.paperPosted ? '✅' : '❌'} 纸质通知${a.paperPosted ? '已张贴' : '未张贴'}</span>
                </div>
                <div class="read-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${readProgress}%"></div>
                    </div>
                    <div class="read-count">${readCount}/${totalResidents} 已读 (${readRate}%)</div>
                </div>
                <div class="announcement-actions">${actions}</div>
            </div>
        `;
    },

    bindEvents() {
        document.querySelectorAll('#announcement-list [data-action]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const action = btn.dataset.action;
                const id = btn.dataset.id;
                if (action === 'complete') this.markComplete(id);
                else if (action === 'edit') this.showForm(id);
                else if (action === 'delete') this.confirmDelete(id);
                else if (action === 'read') this.markRead(id);
                else if (action === 'complaint') this.complaint(id);
                else if (action === 'reason') this.updateOverdueReason(id);
            });
        });
    },

    showForm(id = null, elevatorId = null) {
        const announcement = id ? AnnouncementStore.find(id) : null;
        const elevators = ElevatorStore.all();
        const title = announcement ? '编辑公告' : '发布新公告';

        if (elevators.length === 0) {
            Notification.show('提示', '请先添加电梯档案后再发布公告', 'warning');
            return;
        }

        const defaultStart = new Date(Date.now() + 3600000);
        const defaultEnd = new Date(Date.now() + 3600000 + 3600000);

        const elevatorOptions = elevators.map(e => {
            const selected = (announcement && announcement.elevatorId === e.id) || (elevatorId === e.id) ? 'selected' : '';
            return `<option value="${e.id}" ${selected}>${Utils.escapeHtml(e.building)}栋 ${Utils.escapeHtml(e.unit)}单元 ${Utils.escapeHtml(e.elevatorNo)}号梯</option>`;
        }).join('');

        const body = `
            <form id="announcement-form">
                <div class="form-group">
                    <label>选择电梯 <span class="required">*</span></label>
                    <select name="elevatorId" required>
                        <option value="">请选择电梯</option>
                        ${elevatorOptions}
                    </select>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>停梯时间 <span class="required">*</span></label>
                        <input type="datetime-local" name="startTime" required value="${announcement ? Utils.toInputDateTime(announcement.startTime) : Utils.toInputDateTime(defaultStart)}">
                    </div>
                    <div class="form-group">
                        <label>预计恢复时间 <span class="required">*</span></label>
                        <input type="datetime-local" name="expectedResumeTime" required value="${announcement ? Utils.toInputDateTime(announcement.expectedResumeTime) : Utils.toInputDateTime(defaultEnd)}">
                    </div>
                </div>
                <div class="form-group">
                    <label>影响楼层</label>
                    <input type="text" name="affectedFloors" value="${Utils.escapeHtml(announcement?.affectedFloors || '')}" placeholder="如：1-10层 或 全部楼层">
                </div>
                <div class="form-group">
                    <label>替代电梯</label>
                    <input type="text" name="alternativeElevator" value="${Utils.escapeHtml(announcement?.alternativeElevator || '')}" placeholder="如：1号楼右梯">
                </div>
                <div class="form-group">
                    <label>联系电话</label>
                    <input type="tel" name="contactPhone" value="${Utils.escapeHtml(announcement?.contactPhone || '')}" placeholder="物业或维保人员电话">
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>预估住户数</label>
                        <input type="number" name="totalResidents" value="${announcement?.totalResidents || 50}" min="1" placeholder="用于计算阅读率">
                    </div>
                    <div class="form-group">
                        <label style="display: block; margin-bottom: 8px;">纸质通知</label>
                        <label class="form-checkbox">
                            <input type="checkbox" name="paperPosted" ${announcement?.paperPosted ? 'checked' : ''}>
                            <span>已在电梯口张贴纸质通知</span>
                        </label>
                    </div>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" data-close="modal">取消</button>
                    <button type="submit" class="btn btn-primary">${announcement ? '保存' : '发布'}</button>
                </div>
            </form>
        `;

        Modal.open(title, body);
        this.bindFormEvents(id);
    },

    bindFormEvents(id) {
        document.getElementById('announcement-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            const form = e.target;

            const start = new Date(form.startTime.value).getTime();
            const end = new Date(form.expectedResumeTime.value).getTime();

            if (end <= start) {
                Notification.show('错误', '预计恢复时间必须晚于停梯时间', 'danger');
                return;
            }

            const data = {
                elevatorId: form.elevatorId.value,
                startTime: form.startTime.value,
                expectedResumeTime: form.expectedResumeTime.value,
                affectedFloors: form.affectedFloors.value.trim(),
                alternativeElevator: form.alternativeElevator.value.trim(),
                contactPhone: form.contactPhone.value.trim(),
                totalResidents: parseInt(form.totalResidents.value) || 50,
                paperPosted: form.paperPosted.checked
            };

            if (id) AnnouncementStore.update(id, data);
            else AnnouncementStore.create(data);

            Modal.close();
            this.render(document.getElementById('filter-status').value, document.getElementById('filter-building').value);
            DashboardUI.render();
            Notification.show('成功', id ? '公告已更新' : '公告已发布', 'success');
        });
    },

    markComplete(id) {
        Modal.open('标记已恢复', `
            <p>确认该电梯已恢复运行吗？</p>
            <div class="form-actions">
                <button class="btn btn-secondary" data-close="modal">取消</button>
                <button class="btn btn-success" id="confirm-complete">确认已恢复</button>
            </div>
        `);

        document.getElementById('confirm-complete')?.addEventListener('click', () => {
            AnnouncementStore.update(id, {
                status: 'completed',
                actualResumeTime: new Date().toISOString()
            });
            Modal.close();
            this.render(document.getElementById('filter-status').value, document.getElementById('filter-building').value);
            DashboardUI.render();
            Notification.show('已恢复', '电梯已标记为恢复运行', 'success');
        });
    },

    markRead(id) {
        const updated = AnnouncementStore.markAsRead(id);
        if (updated) {
            ResidentReminderStore.refreshSnapshot(id, 'reminder_60');
            ResidentReminderStore.refreshSnapshot(id, 'overdue');
            this.render(document.getElementById('filter-status').value, document.getElementById('filter-building').value);
            DashboardUI.render();
            Notification.show('已标记', '感谢您的阅读', 'success');
        }
    },

    complaint(id) {
        Modal.open('提交投诉', `
            <p>我们会重视您的反馈，该楼栋投诉数将被记录。</p>
            <div class="form-actions">
                <button class="btn btn-secondary" data-close="modal">取消</button>
                <button class="btn btn-danger" id="confirm-complaint">确认投诉</button>
            </div>
        `);

        document.getElementById('confirm-complaint')?.addEventListener('click', () => {
            AnnouncementStore.addComplaint(id);
            Modal.close();
            this.render(document.getElementById('filter-status').value, document.getElementById('filter-building').value);
            DashboardUI.render();
            Notification.show('已记录', '您的投诉已记录，物业会尽快处理', 'warning');
        });
    },

    updateOverdueReason(id) {
        const announcement = AnnouncementStore.find(id);
        if (!announcement) return;

        Modal.open('更新超时原因', `
            <form id="reason-form">
                <div class="form-group">
                    <label>超时原因说明 <span class="required">*</span></label>
                    <textarea name="reason" required placeholder="请说明为什么超过预计恢复时间仍未恢复...">${Utils.escapeHtml(announcement.overdueReason || '')}</textarea>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" data-close="modal">取消</button>
                    <button type="submit" class="btn btn-primary">保存</button>
                </div>
            </form>
        `);

        document.getElementById('reason-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            const reason = e.target.reason.value.trim();
            AnnouncementStore.update(id, { overdueReason: reason });
            Modal.close();
            this.render(document.getElementById('filter-status').value, document.getElementById('filter-building').value);
            DashboardUI.render();
            Notification.show('已更新', '超时原因已记录', 'success');
        });
    },

    confirmDelete(id) {
        Modal.open('确认删除', `
            <p>确定要删除这条公告吗？</p>
            <p style="color: var(--danger); margin-top: 8px; font-size: 14px;">此操作不可恢复</p>
            <div class="form-actions">
                <button class="btn btn-secondary" data-close="modal">取消</button>
                <button class="btn btn-danger" id="confirm-delete-ann">确认删除</button>
            </div>
        `);

        document.getElementById('confirm-delete-ann')?.addEventListener('click', () => {
            AnnouncementStore.remove(id);
            Modal.close();
            this.render(document.getElementById('filter-status').value, document.getElementById('filter-building').value);
            DashboardUI.render();
            Notification.show('已删除', '公告已删除', 'success');
        });
    },

    refreshBuildingFilter() {
        const select = document.getElementById('filter-building');
        const buildings = ElevatorStore.getBuildings();
        select.innerHTML = '<option value="">全部楼栋</option>' +
            buildings.map(b => `<option value="${Utils.escapeHtml(b)}">${Utils.escapeHtml(b)}栋</option>`).join('');
    }
};

const DashboardUI = {
    render() {
        StatusHelper.refreshAllStatus();
        const announcements = AnnouncementStore.all();
        const now = Date.now();
        const currentMonth = new Date();

        const thisMonthAnnouncements = announcements.filter(a => Utils.isSameMonth(a.startTime, currentMonth));
        document.getElementById('stat-monthly-count').textContent = thisMonthAnnouncements.length;

        const completed = announcements.filter(a => a.actualResumeTime && a.status === 'completed');
        if (completed.length > 0) {
            const totalMinutes = completed.reduce((sum, a) => {
                return sum + Utils.diffMinutes(a.startTime, a.actualResumeTime);
            }, 0);
            const avg = Math.round(totalMinutes / completed.length);
            document.getElementById('stat-avg-recovery').textContent = avg;
        } else {
            document.getElementById('stat-avg-recovery').textContent = '0';
        }

        const validAnnouncements = announcements.filter(a => a.totalResidents > 0);
        if (validAnnouncements.length > 0) {
            let totalRead = 0;
            let totalResidents = 0;
            validAnnouncements.forEach(a => {
                totalRead += (a.readBy || []).length;
                totalResidents += a.totalResidents || 0;
            });
            const rate = totalResidents > 0 ? Math.round((totalRead / totalResidents) * 100) : 0;
            document.getElementById('stat-read-rate').textContent = rate;
        } else {
            document.getElementById('stat-read-rate').textContent = '0';
        }

        const buildingComplaints = {};
        announcements.forEach(a => {
            const elev = ElevatorStore.find(a.elevatorId);
            if (!elev) return;
            const key = elev.building || '未知';
            buildingComplaints[key] = (buildingComplaints[key] || 0) + (a.complaints || 0);
        });

        const sortedComplaints = Object.entries(buildingComplaints)
            .sort((a, b) => b[1] - a[1]);

        if (sortedComplaints.length > 0 && sortedComplaints[0][1] > 0) {
            document.getElementById('stat-complaint-building').textContent = sortedComplaints[0][0] + '栋';
            document.getElementById('stat-complaint-count').textContent = sortedComplaints[0][1] + ' 起';
        } else {
            document.getElementById('stat-complaint-building').textContent = '-';
            document.getElementById('stat-complaint-count').textContent = '0 起';
        }

        this.renderAlerts(announcements, now);
        this.renderUpcoming(announcements, now);
        this.renderComplaintChart(sortedComplaints);
        this.renderResidentReminders();
    },

    renderAlerts(announcements, now) {
        const list = document.getElementById('alert-list');
        const badge = document.getElementById('alert-count');

        const overdue = announcements.filter(a => a.status === 'overdue');
        badge.textContent = overdue.length;

        if (overdue.length === 0) {
            list.innerHTML = `<div class="empty-state">暂无异常</div>`;
            return;
        }

        list.innerHTML = overdue.map(a => {
            const elevator = ElevatorStore.find(a.elevatorId);
            const overdueMinutes = Utils.diffMinutes(a.expectedResumeTime, now);
            const loc = elevator ? `${elevator.building}栋${elevator.unit}单元${elevator.elevatorNo}号梯` : '未知电梯';
            return `
                <div class="alert-item overdue">
                    <div class="alert-title">🔴 ${Utils.escapeHtml(loc)} 超时未恢复</div>
                    <div class="alert-desc">已超时 ${Utils.formatDuration(overdueMinutes)}，预计恢复：${Utils.formatDateTime(a.expectedResumeTime)}${a.overdueReason ? ` | 原因：${Utils.escapeHtml(a.overdueReason)}` : ' | 请及时更新原因'}</div>
                </div>
            `;
        }).join('');
    },

    renderUpcoming(announcements, now) {
        const list = document.getElementById('upcoming-list');

        const upcoming = announcements
            .filter(a => a.status === 'upcoming')
            .map(a => ({
                ...a,
                minutesToStart: Math.round((new Date(a.startTime).getTime() - now) / 60000)
            }))
            .filter(a => a.minutesToStart <= 60 && a.minutesToStart > 0)
            .sort((a, b) => a.minutesToStart - b.minutesToStart);

        if (upcoming.length === 0) {
            list.innerHTML = `<div class="empty-state">暂无即将停梯的电梯（1小时内）</div>`;
            return;
        }

        list.innerHTML = upcoming.map(a => {
            const elevator = ElevatorStore.find(a.elevatorId);
            const loc = elevator ? `${elevator.building}栋${elevator.unit}单元${elevator.elevatorNo}号梯` : '未知电梯';
            const readCount = (a.readBy || []).length;
            const totalResidents = a.totalResidents || 50;
            const unread = Math.max(0, totalResidents - readCount);
            return `
                <div class="upcoming-item">
                    <div class="upcoming-title">⏰ ${Utils.escapeHtml(loc)} 将在 ${a.minutesToStart} 分钟后停梯</div>
                    <div class="upcoming-desc">停梯时间：${Utils.formatDateTime(a.startTime)} | 影响楼层：${Utils.escapeHtml(a.affectedFloors || '全部')} | 还有 ${unread} 户未阅读</div>
                </div>
            `;
        }).join('');
    },

    renderComplaintChart(sortedComplaints) {
        const container = document.getElementById('complaint-chart');

        if (sortedComplaints.length === 0 || sortedComplaints[0][1] === 0) {
            container.innerHTML = `<div class="empty-state">暂无投诉数据</div>`;
            return;
        }

        const maxCount = sortedComplaints[0][1];

        container.innerHTML = sortedComplaints.map(([building, count], idx) => {
            const width = Math.max(5, (count / maxCount) * 100);
            const isTop = idx === 0;
            return `
                <div class="complaint-bar-item">
                    <div class="complaint-bar-label">
                        <span class="building">${isTop ? '🏆 ' : ''}${Utils.escapeHtml(building)}栋</span>
                        <span class="count">${count} 起投诉</span>
                    </div>
                    <div class="complaint-bar-track">
                        <div class="complaint-bar-fill ${isTop ? 'danger' : ''}" style="width: ${width}%"></div>
                    </div>
                </div>
            `;
        }).join('');
    },

    renderResidentReminders() {
        const list = document.getElementById('reminder-list');
        const badge = document.getElementById('reminder-count');
        if (!list || !badge) return;

        const reminders = ResidentReminderStore.getActive();
        const pending = reminders.filter(r => !r.resolved);
        badge.textContent = pending.length;

        if (reminders.length === 0) {
            list.innerHTML = `<div class="empty-state">暂无提醒记录。公告到停梯前 1 小时或超时时会自动生成住户提醒。</div>`;
            return;
        }

        list.innerHTML = reminders.map(r => this.renderResidentReminderItem(r)).join('');
        this.bindReminderEvents();
    },

    renderResidentReminderItem(r) {
        const typeClass = r.type === 'overdue' ? 'overdue' : (r.resolved ? 'resolved' : '');
        const typeIcon = r.type === 'overdue' ? '🔴' : '⏰';
        const typeLabel = r.type === 'overdue' ? '超时未恢复' : '停梯前1小时提醒';
        const resolvedTag = r.resolved ? '<span class="reminder-tag resolved">已处理</span>' : '';

        let titleExtra = '';
        if (r.type === 'reminder_60' && r.minutesToStart != null) {
            titleExtra = `（还有 ${r.minutesToStart} 分钟停梯）`;
        } else if (r.type === 'overdue' && r.overdueMinutes != null) {
            titleExtra = `（已超时 ${Utils.formatDuration(r.overdueMinutes)}）`;
        }

        const snapshotTotal = r.snapshotTotal || 0;
        const snapshotUnread = r.snapshotUnreadCount || 0;
        const snapshotRead = r.snapshotReadCount || 0;
        const readRate = snapshotTotal > 0 ? Math.round((snapshotRead / snapshotTotal) * 100) : 0;

        const unreadBoxHtml = `
            <div class="reminder-unread-box">
                <div class="unread-stats">
                    <div class="stat-group">
                        <span class="big-num">${snapshotUnread}</span>
                        <span class="small-label">未读户数</span>
                    </div>
                    <div class="stat-group read">
                        <span class="big-num">${snapshotRead}</span>
                        <span class="small-label">已读户数</span>
                    </div>
                    <div class="stat-group">
                        <span class="big-num" style="color: var(--text-primary);">${snapshotTotal}</span>
                        <span class="small-label">总户数</span>
                    </div>
                </div>
                <div class="reminder-mini-progress">
                    <div class="bar"><div class="bar-fill" style="width: ${readRate}%;"></div></div>
                    <div class="pct">阅读率 ${readRate}% ｜ 数据快照时间 ${Utils.formatDateTime(r.snapshotAt || r.createdAt)}</div>
                </div>
            </div>
        `;

        let infoGridHtml = `
            <div class="reminder-info-grid">
                <div class="reminder-info-item">
                    <span class="label">停梯时间</span>
                    <span class="value">${Utils.formatDateTime(r.startTime)}</span>
                </div>
                <div class="reminder-info-item">
                    <span class="label">影响楼层</span>
                    <span class="value">${Utils.escapeHtml(r.affectedFloors || '全部楼层')}</span>
                </div>
        `;
        if (r.type === 'overdue') {
            infoGridHtml += `
                <div class="reminder-info-item">
                    <span class="label">预计恢复</span>
                    <span class="value">${Utils.formatDateTime(r.expectedResumeTime)}</span>
                </div>
            `;
        }
        if (r.alternativeElevator) {
            infoGridHtml += `
                <div class="reminder-info-item">
                    <span class="label">替代电梯</span>
                    <span class="value">${Utils.escapeHtml(r.alternativeElevator)}</span>
                </div>
            `;
        }
        if (r.contactPhone) {
            infoGridHtml += `
                <div class="reminder-info-item">
                    <span class="label">联系电话</span>
                    <span class="value">${Utils.escapeHtml(r.contactPhone)}</span>
                </div>
            `;
        }
        if (r.maintenanceCompany) {
            infoGridHtml += `
                <div class="reminder-info-item">
                    <span class="label">维保公司</span>
                    <span class="value">${Utils.escapeHtml(r.maintenanceCompany)}</span>
                </div>
            `;
        }
        if (r.propertyCompany) {
            infoGridHtml += `
                <div class="reminder-info-item">
                    <span class="label">责任物业</span>
                    <span class="value">${Utils.escapeHtml(r.propertyCompany)}</span>
                </div>
            `;
        }
        infoGridHtml += `</div>`;

        const reasonHtml = (r.type === 'overdue' && r.overdueReason)
            ? `<div class="reminder-reason">⚠️ 超时原因：${Utils.escapeHtml(r.overdueReason)}</div>`
            : '';

        const paperHtml = `<span class="reminder-paper ${r.paperPosted ? 'yes' : 'no'}">${r.paperPosted ? '✅' : '❌'} 纸质通知${r.paperPosted ? '已张贴' : '未张贴'}</span>`;

        let actionsHtml = '';
        if (!r.resolved) {
            actionsHtml = `
                <div class="reminder-actions">
                    <button class="btn btn-success btn-sm" data-action="resolve-reminder" data-id="${r.id}">标记已处理</button>
                    <button class="btn btn-secondary btn-sm" data-action="dismiss-reminder" data-id="${r.id}">忽略</button>
                </div>
            `;
        }

        return `
            <div class="reminder-item ${typeClass}" data-id="${r.id}">
                <div class="reminder-header">
                    <div class="reminder-title">
                        ${typeIcon} ${Utils.escapeHtml(r.location)} ${titleExtra}
                        <span class="reminder-tag ${r.type}">${typeLabel}</span>
                        ${resolvedTag}
                    </div>
                    <div class="reminder-time">创建于 ${Utils.formatDateTime(r.createdAt)}</div>
                </div>
                ${unreadBoxHtml}
                ${infoGridHtml}
                ${reasonHtml}
                <div class="reminder-footer">
                    ${paperHtml}
                    ${actionsHtml}
                </div>
            </div>
        `;
    },

    bindReminderEvents() {
        document.querySelectorAll('[data-action="resolve-reminder"]').forEach(btn => {
            btn.addEventListener('click', () => {
                ResidentReminderStore.update(btn.dataset.id, {
                    resolved: true,
                    resolvedAt: Date.now()
                });
                this.renderResidentReminders();
                Notification.show('已处理', '提醒已标记为已处理', 'success');
            });
        });

        document.querySelectorAll('[data-action="dismiss-reminder"]').forEach(btn => {
            btn.addEventListener('click', () => {
                ResidentReminderStore.dismiss(btn.dataset.id);
                this.renderResidentReminders();
                Notification.show('已忽略', '提醒已从列表移除', 'info');
            });
        });
    }
};

const ReminderChecker = {
    check() {
        StatusHelper.refreshAllStatus();
        const announcements = AnnouncementStore.all();
        const now = Date.now();

        announcements.forEach(a => {
            if (a.status === 'completed') {
                this.resolveExisting(a.id, 'reminder_60');
                this.resolveExisting(a.id, 'overdue');
                return;
            }

            const elevator = ElevatorStore.find(a.elevatorId);
            const building = elevator ? elevator.building : '-';
            const unit = elevator ? elevator.unit : '-';
            const elevatorNo = elevator ? elevator.elevatorNo : '-';
            const loc = elevator ? `${building}栋${unit}单元${elevatorNo}号梯` : '电梯';
            const propertyCompany = elevator ? elevator.propertyCompany : '';
            const maintenanceCompany = elevator ? elevator.maintenanceCompany : '';

            const readCount = (a.readBy || []).length;
            const totalResidents = a.totalResidents || 0;
            const unreadCount = Math.max(0, totalResidents - readCount);

            const start = new Date(a.startTime).getTime();
            const minutesToStart = Math.round((start - now) / 60000);

            if (minutesToStart <= 60 && minutesToStart > 0 && a.status === 'upcoming') {
                if (!ResidentReminderStore.findByAnnouncementId(a.id, 'reminder_60')) {
                    ResidentReminderStore.create({
                        type: 'reminder_60',
                        announcementId: a.id,
                        building,
                        unit,
                        elevatorNo,
                        location: loc,
                        startTime: a.startTime,
                        minutesToStart,
                        affectedFloors: a.affectedFloors || '全部楼层',
                        alternativeElevator: a.alternativeElevator || '',
                        contactPhone: a.contactPhone || '',
                        paperPosted: !!a.paperPosted,
                        propertyCompany,
                        maintenanceCompany,
                        snapshotReadCount: readCount,
                        snapshotUnreadCount: unreadCount,
                        snapshotTotal: totalResidents,
                        snapshotAt: now
                    });
                    if (unreadCount > 0) {
                        Notification.show(
                            '⏰ 停梯提醒',
                            `${loc} 将在 ${minutesToStart} 分钟后停梯，还有 ${unreadCount} 户未阅读公告`,
                            'warning',
                            8000
                        );
                    } else {
                        Notification.show(
                            '⏰ 停梯提醒',
                            `${loc} 将在 ${minutesToStart} 分钟后停梯`,
                            'warning',
                            6000
                        );
                    }
                } else {
                    ResidentReminderStore.refreshSnapshot(a.id, 'reminder_60');
                    ResidentReminderStore.updateByAnnouncement(a.id, 'reminder_60', {
                        minutesToStart,
                        resolved: false
                    });
                }
            }

            if (a.status === 'overdue') {
                const overdueMinutes = Utils.diffMinutes(a.expectedResumeTime, now);
                if (!ResidentReminderStore.findByAnnouncementId(a.id, 'overdue')) {
                    ResidentReminderStore.create({
                        type: 'overdue',
                        announcementId: a.id,
                        building,
                        unit,
                        elevatorNo,
                        location: loc,
                        startTime: a.startTime,
                        expectedResumeTime: a.expectedResumeTime,
                        overdueMinutes,
                        overdueReason: a.overdueReason || '',
                        affectedFloors: a.affectedFloors || '全部楼层',
                        alternativeElevator: a.alternativeElevator || '',
                        contactPhone: a.contactPhone || '',
                        paperPosted: !!a.paperPosted,
                        propertyCompany,
                        maintenanceCompany,
                        snapshotReadCount: readCount,
                        snapshotUnreadCount: unreadCount,
                        snapshotTotal: totalResidents,
                        snapshotAt: now
                    });
                    Notification.show(
                        '🔴 超时告警',
                        `${loc} 已超时 ${Utils.formatDuration(overdueMinutes)} 未恢复，请及时处理`,
                        'danger',
                        10000
                    );
                } else {
                    ResidentReminderStore.refreshSnapshot(a.id, 'overdue');
                    ResidentReminderStore.updateByAnnouncement(a.id, 'overdue', {
                        overdueMinutes,
                        overdueReason: a.overdueReason || '',
                        resolved: false
                    });
                }
            }
        });
    },

    resolveExisting(announcementId, type) {
        ResidentReminderStore.updateByAnnouncement(announcementId, type, {
            resolved: true,
            resolvedAt: Date.now()
        });
    }
};

const App = {
    init() {
        this.seedDemoData();
        this.bindNavigation();
        this.bindModal();
        this.bindToolbar();
        this.renderAll();

        setInterval(() => {
            AnnouncementUI.render(document.getElementById('filter-status').value, document.getElementById('filter-building').value);
            DashboardUI.render();
            ReminderChecker.check();
        }, 30000);

        setTimeout(() => ReminderChecker.check(), 2000);
    },

    seedDemoData() {
        if (ElevatorStore.all().length > 0) return;

        const elevators = [
            { building: '1', unit: '1', elevatorNo: '左', maintenanceCompany: '永安电梯维保有限公司', propertyCompany: '阳光物业管理有限公司', lastInspectionDate: '2026-05-10', photo: '' },
            { building: '1', unit: '1', elevatorNo: '右', maintenanceCompany: '永安电梯维保有限公司', propertyCompany: '阳光物业管理有限公司', lastInspectionDate: '2026-05-10', photo: '' },
            { building: '2', unit: '1', elevatorNo: '左', maintenanceCompany: '顺达电梯服务有限公司', propertyCompany: '阳光物业管理有限公司', lastInspectionDate: '2026-05-20', photo: '' },
            { building: '2', unit: '2', elevatorNo: '右', maintenanceCompany: '顺达电梯服务有限公司', propertyCompany: '阳光物业管理有限公司', lastInspectionDate: '2026-05-22', photo: '' },
            { building: '3', unit: '1', elevatorNo: '1', maintenanceCompany: '永安电梯维保有限公司', propertyCompany: '阳光物业管理有限公司', lastInspectionDate: '2026-06-01', photo: '' }
        ];

        const createdElevators = elevators.map(e => ElevatorStore.create(e));

        const now = Date.now();
        const announcements = [
            { elevatorId: createdElevators[0].id, startTime: new Date(now + 30 * 60000).toISOString(), expectedResumeTime: new Date(now + 90 * 60000).toISOString(), affectedFloors: '1-15层', alternativeElevator: '1栋1单元右梯', contactPhone: '13800138000', totalResidents: 48, paperPosted: true, readBy: ['user1', 'user2', 'user3'], complaints: 0 },
            { elevatorId: createdElevators[2].id, startTime: new Date(now - 120 * 60000).toISOString(), expectedResumeTime: new Date(now - 30 * 60000).toISOString(), affectedFloors: '全部楼层', alternativeElevator: '2栋2单元右梯', contactPhone: '13900139000', totalResidents: 56, paperPosted: true, readBy: ['user1'], complaints: 3, overdueReason: '配件损坏，正在紧急调配中' },
            { elevatorId: createdElevators[1].id, startTime: new Date(now - 300 * 60000).toISOString(), expectedResumeTime: new Date(now - 180 * 60000).toISOString(), affectedFloors: '1-10层', alternativeElevator: '1栋1单元左梯', contactPhone: '13800138000', totalResidents: 48, paperPosted: true, readBy: ['user1', 'user2', 'user3', 'user4', 'user5'], complaints: 1, actualResumeTime: new Date(now - 160 * 60000).toISOString(), status: 'completed' },
            { elevatorId: createdElevators[4].id, startTime: new Date(now + 180 * 60000).toISOString(), expectedResumeTime: new Date(now + 240 * 60000).toISOString(), affectedFloors: '5-10层', alternativeElevator: '无', contactPhone: '13700137000', totalResidents: 40, paperPosted: false, readBy: [], complaints: 0 }
        ];

        announcements.forEach(a => AnnouncementStore.create(a));
    },

    bindNavigation() {
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
                document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
                btn.classList.add('active');
                document.getElementById(btn.dataset.tab).classList.add('active');

                if (btn.dataset.tab === 'dashboard') DashboardUI.render();
                else if (btn.dataset.tab === 'announcements') AnnouncementUI.render(document.getElementById('filter-status').value, document.getElementById('filter-building').value);
                else if (btn.dataset.tab === 'elevators') ElevatorUI.render(document.getElementById('search-elevator').value);
            });
        });
    },

    bindModal() {
        document.querySelectorAll('[data-close="modal"]').forEach(el => {
            el.addEventListener('click', () => Modal.close());
        });
    },

    bindToolbar() {
        document.getElementById('btn-add-elevator')?.addEventListener('click', () => ElevatorUI.showForm());
        document.getElementById('btn-add-announcement')?.addEventListener('click', () => AnnouncementUI.showForm());

        document.getElementById('search-elevator')?.addEventListener('input', (e) => {
            ElevatorUI.render(e.target.value);
        });

        document.getElementById('filter-status')?.addEventListener('change', () => {
            AnnouncementUI.render(document.getElementById('filter-status').value, document.getElementById('filter-building').value);
        });

        document.getElementById('filter-building')?.addEventListener('change', () => {
            AnnouncementUI.render(document.getElementById('filter-status').value, document.getElementById('filter-building').value);
        });

        document.getElementById('btn-clear-reminders')?.addEventListener('click', () => {
            const reminders = ResidentReminderStore.all();
            if (reminders.length === 0) {
                Notification.show('提示', '暂无可清理的提醒', 'info');
                return;
            }
            Modal.open('清空提醒记录', `
                <p>将清理所有已处理或已忽略的提醒记录。</p>
                <p style="color: var(--text-secondary); margin-top: 6px; font-size: 13px;">未处理的提醒会保留</p>
                <div class="form-actions">
                    <button class="btn btn-secondary" data-close="modal">取消</button>
                    <button class="btn btn-danger" id="confirm-clear-reminders">确认清理</button>
                </div>
            `);
            document.getElementById('confirm-clear-reminders')?.addEventListener('click', () => {
                const kept = ResidentReminderStore.all().filter(r => !r.resolved && !r.dismissed);
                Storage.set(STORAGE_KEYS.RESIDENT_REMINDERS, kept);
                Modal.close();
                DashboardUI.renderResidentReminders();
                Notification.show('已清理', '已清理已处理/已忽略的提醒', 'success');
            });
        });
    },

    renderAll() {
        ElevatorUI.render();
        AnnouncementUI.render();
        AnnouncementUI.refreshBuildingFilter();
        DashboardUI.render();
    }
};

document.addEventListener('DOMContentLoaded', () => App.init());
