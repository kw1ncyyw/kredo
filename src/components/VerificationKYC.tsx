/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { UserProfile, Language, AppTheme } from '../types';
import { 
  ShieldCheck, AlertTriangle, UploadCloud, FileText, Check, X, Mail, Phone, 
  Calendar, Eye, ChevronRight, UserCheck, ShieldAlert, Award, ChevronDown, 
  Search, ExternalLink, HelpCircle, ArrowUpRight, ArrowDownLeft 
} from 'lucide-react';
import { KredoData, isSupabaseConfigured } from '../supabase';

interface VerificationKYCProps {
  user: UserProfile;
  lang: Language;
  theme: AppTheme;
  updateProfile: (updated: Partial<UserProfile>) => void;
  triggerValidationSystem?: () => void;
}

interface KYCState {
  status: 'Not Started' | 'Pending Review' | 'Verified' | 'Rejected';
  emailVerified: boolean;
  phoneVerified: boolean;
  passportName: string | null;
  passportSize: string | null;
  selfieName: string | null;
  selfieSize: string | null;
  reviewDate: string | null;
  adminNotes: string | null;
  documentType?: string;
  documentNumber?: string;
}

export default function VerificationKYC({
  user,
  lang,
  theme,
  updateProfile,
}: VerificationKYCProps) {
  // Localized dictionary for KYC Page & Admin Console
  const t = {
    ua: {
      title: 'Центр верифікації (KYC)',
      subtitle: 'Підтвердження вашої особи для підвищення лімітів та фінансової безпеки.',
      statusTitle: 'Поточний статус:',
      statusNotStarted: 'Не розпочато',
      statusPending: 'Очікує перевірки',
      statusVerified: 'Підтверджено',
      statusRejected: 'Відхилено',
      emailStep: '1. Верифікація пошти',
      passportStep: '2. Копія паспорта / ID-картки',
      selfieStep: '3. Селфі з документом',
      dragLabel: 'Перетягніть файл сюди або натисніть',
      uploaded: 'Завантажено: ',
      submitBtn: 'Надіслати документи на розгляд',
      adminTriggerNotes: 'Розділ симуляції майбутнього бек-офісу KREDO',
      adminTitle: 'Кабінет модератора KREDO Admin',
      adminUsers: 'База користувачів',
      adminReviews: 'Перевірка KYC',
      adminTransactions: 'Транзакційний реєстр',
      adminSupport: 'Підтримка користувачів',
      approveBtn: 'Затвердити верифікацію',
      rejectBtn: 'Відхилити запит',
      notesPlaceholder: 'Введіть коментар для користувача...',
      reviewDateText: 'Дата перевірки: ',
      riskAlertTitle: 'Вимоги безпеки',
      riskAlertText: 'Згідно з європейськими нормами боротьби з відмиванням грошей (AML) та тероризмом, кожен користувач мусить надати документи для транзакцій понад 5,000 UAH.',
      verifiedSuccessTitle: 'Поздравляем!',
      verifiedSuccessText: 'Ваша особа повністю підтверджена юридичним партнером LEXAR. Усі обмеження на рахунку знято.',
      rejectedTitle: 'Потрібні виправлення',
      rejectedText: 'Деякі документи не відповідають вимогам чіткості. Будь ласка, перегляньте деталі та завантажте повторно.',
      sendOtp: 'Надіслати SMS з кодом',
      enterOtp: 'Введіть код з SMS (1234)',
      otpVerified: 'Телефон успішно верифіковано!',
      otpError: 'Неправильний код!',
      verifyEmailBtn: 'Надіслати посилання',
      emailVerifiedText: 'Пошта успішно підтверджена!',
      usersCount: 'Всього користувачів',
      activeDisputes: 'Активні диспути',
      unresolvedSupport: 'Невирішені запити',
      escrowSecurity: 'KREDO — ваша третя сторона довіри.',
    },
    en: {
      title: 'Verification Center (KYC)',
      subtitle: 'Validate your identity as part of our secure financial custody compliance standards.',
      statusTitle: 'Current Compliance Status:',
      statusNotStarted: 'Not Started',
      statusPending: 'Pending Review',
      statusVerified: 'Verified',
      statusRejected: 'Rejected',
      emailStep: '1. Email Security Verification',
      passportStep: '2. Passport or Official ID Upload',
      selfieStep: '3. Live Persona Selfie check',
      dragLabel: 'Drag & drop your file here, or click to upload',
      uploaded: 'Uploaded: ',
      submitBtn: 'Submit Dossier for KYC Audit',
      adminTriggerNotes: 'Future Back-Office Workspace Simulator',
      adminTitle: 'KREDO Back-Office Administration Desk',
      adminUsers: 'User Directory',
      adminReviews: 'KYC Moderation Queue',
      adminTransactions: 'Escrow Ledger',
      adminSupport: 'Support & Inquiries',
      approveBtn: 'Grant Verification Clearance',
      rejectBtn: 'Refuse Verification Request',
      notesPlaceholder: 'Provide feedback notes for the applicant...',
      reviewDateText: 'Audit timestamp: ',
      riskAlertTitle: 'Strict Custody Safeguards',
      riskAlertText: 'Complying with Anti-Money Laundering (AML) directives, all transactions above standard volumes require vetted identity status prior to ledger release.',
      verifiedSuccessTitle: 'Audit Successful!',
      verifiedSuccessText: 'Your account identity dossier is certified by our legal partner LEXAR. Full ledger limits established.',
      rejectedTitle: 'Correction Required',
      rejectedText: 'Certain files uploaded lacked sufficient legibility. Please review our audit remarks and re-submit.',
      sendOtp: 'Send OTP SMS',
      enterOtp: 'Enter OTP key (1234)',
      otpVerified: 'SMS identity confirmed!',
      otpError: 'Incorrect key sequence!',
      verifyEmailBtn: 'Verify Account Email',
      emailVerifiedText: 'Identity Email Verified!',
      usersCount: 'Total Accounts',
      activeDisputes: 'Active Disputes',
      unresolvedSupport: 'Open Support Tickets',
      escrowSecurity: 'KREDO — your trusted escrow partner.',
    },
    ru: {
      title: 'Центр верификации (KYC)',
      subtitle: 'Подтвердите свою личность для увеличения лимитов и обеспечения финансовой безопасности.',
      statusTitle: 'Текущий статус:',
      statusNotStarted: 'Не начато',
      statusPending: 'Ожидает проверки',
      statusVerified: 'Подтверждено',
      statusRejected: 'Отклонено',
      emailStep: '1. Верификация почты',
      passportStep: '2. Копия паспорта / ID-карты',
      selfieStep: '3. Селфи с документом',
      dragLabel: 'Перетащите файл сюда или нажмите',
      uploaded: 'Загружено: ',
      submitBtn: 'Отправить документы на рассмотрение',
      adminTriggerNotes: 'Раздел симуляции будущего бэк-офиса KREDO',
      adminTitle: 'Кабинет модератора KREDO Admin',
      adminUsers: 'База пользователей',
      adminReviews: 'Проверка KYC',
      adminTransactions: 'Транзакционный реестр',
      adminSupport: 'Поддержка пользователей',
      approveBtn: 'Снять ограничения',
      rejectBtn: 'Отклонить запрос',
      notesPlaceholder: 'Введите комментарий для пользователя...',
      reviewDateText: 'Дата проверки: ',
      riskAlertTitle: 'Требования безопасности',
      riskAlertText: 'В соответствии с европейскими стандартами борьбы с отмыванием денег (AML), каждый пользователь обязан подтвердить личность для операций свыше 5,000 UAH.',
      verifiedSuccessTitle: 'Поздравляем!',
      verifiedSuccessText: 'Ваша личность успешно подтверждена юридическим партнером LEXAR. Все лимиты аккаунта расширены.',
      rejectedTitle: 'Требуются исправления',
      rejectedText: 'Загруженные файлы не соответствуют стандартам четкости. Пожалуйста, исправьте указанные ошибки.',
      sendOtp: 'Получить SMS-код',
      enterOtp: 'Введите OTP из SMS (1234)',
      otpVerified: 'Номер успешно подтвержден!',
      otpError: 'Код введен неверно!',
      verifyEmailBtn: 'Отправить ссылку',
      emailVerifiedText: 'Почта успешно подтверждена!',
      usersCount: 'Всего пользователей',
      activeDisputes: 'Активные споры',
      unresolvedSupport: 'Неразрешенные тикеты',
      escrowSecurity: 'KREDO — ваша третья сторона доверия.',
    },
  }[lang] || {
    title: 'Verification Center (KYC)',
    subtitle: 'Validate your identity as part of our secure financial custody compliance standards.',
    statusTitle: 'Current Compliance Status:',
    statusNotStarted: 'Not Started',
    statusPending: 'Pending Review by Legal Department',
    statusVerified: 'Verified Account',
    statusRejected: 'Submission Rejected',
    emailStep: '1. Email Security Verification',
    passportStep: '2. Passport or Official ID Upload',
    selfieStep: '3. Live Persona Selfie check',
    dragLabel: 'Drag & drop his file here, or click to upload',
    uploaded: 'Uploaded: ',
    submitBtn: 'Submit Dossier for KYC Audit',
    adminTriggerNotes: 'Future Back-Office Workspace Simulator',
    adminTitle: 'KREDO Back-Office Administration Desk',
    adminUsers: 'User Directory',
    adminReviews: 'KYC Moderation Queue',
    adminTransactions: 'Escrow Ledger',
    adminSupport: 'Support & Inquiries',
    approveBtn: 'Grant Verification Clearance',
    rejectBtn: 'Refuse Verification Request',
    notesPlaceholder: 'Provide feedback notes for the applicant...',
    reviewDateText: 'Audit timestamp: ',
    riskAlertTitle: 'Strict Custody Safeguards',
    riskAlertText: 'Complying with Anti-Money Laundering (AML) directives, all transactions above standard volumes require vetted identity status prior to ledger release.',
    verifiedSuccessTitle: 'Audit Successful!',
    verifiedSuccessText: 'Your account identity dossier is certified by our legal partner LEXAR. Full ledger limits established.',
    rejectedTitle: 'Correction Required',
    rejectedText: 'Certain files uploaded lacked sufficient legibility. Please review our audit remarks and re-submit.',
    sendOtp: 'Send OTP SMS',
    enterOtp: 'Enter OTP key (1234)',
    otpVerified: 'SMS identity confirmed!',
    otpError: 'Incorrect key sequence!',
    verifyEmailBtn: 'Verify Account Email',
    emailVerifiedText: 'Identity Email Verified!',
    usersCount: 'Total Accounts',
    activeDisputes: 'Active Disputes',
    unresolvedSupport: 'Open Support Tickets',
    escrowSecurity: 'KREDO — your trusted escrow partner.',
  };

  const defaultSimulatedUsers: Array<Partial<UserProfile> & { kycState: string }> = [
    { id: 'u-1', email: 'vovchenko.oleg@gmail.com', fullName: 'Олег Вовченко', phone: '+380-67-200-1122', joinedAt: '2026-03-01', balance: 45000, kycState: lang === 'ua' ? 'Тестування' : lang === 'ru' ? 'Тестирование' : 'Verified' },
    { id: 'u-2', email: 'kovalchuk.marina@ukr.net', fullName: 'Марічка Ковальчук', phone: '+380-93-145-8899', joinedAt: '2026-05-15', balance: 135000, kycState: lang === 'ua' ? 'Перевіряється' : lang === 'ru' ? 'Проверяется' : 'Pending Review' },
    { id: 'u-3', email: 'taras.shevchenko@gmail.com', fullName: 'Тарас Шевченко', phone: '+380-50-666-4444', joinedAt: '2026-06-01', balance: 800, kycState: lang === 'ua' ? 'Не розпочато' : lang === 'ru' ? 'Не начато' : 'Not Started' },
    { id: 'u-4', email: 'p.poroshenko@chocolate.ua', fullName: 'Петро Рошен', phone: '+380-67-555-5555', joinedAt: '2026-01-20', balance: 9945000, kycState: lang === 'ua' ? 'Верифіковано' : lang === 'ru' ? 'Верифицировано' : 'Verified' },
    { id: 'u-5', email: 'shostak.dariya@kredo.inc', fullName: 'Дарія Шостак', phone: '+380-68-990-2211', joinedAt: '2026-06-05', balance: 0, kycState: lang === 'ua' ? 'Відхилено' : lang === 'ru' ? 'Отклонено' : 'Rejected' },
  ];

  const defaultSimulatedLedger = [
    { id: 'tx-2239', buyer: 'user@kredo.com', seller: 'kovalchuk.marina@ukr.net', item: 'Розробка Web-порталу на React', status: 'funded', amount: 80000, date: '2026-06-07' },
    { id: 'tx-2238', buyer: 'vovchenko.oleg@gmail.com', seller: 'user@kredo.com', item: 'Постачання обладнання для серверів', status: 'released', amount: 45000, date: '2026-06-04' },
    { id: 'tx-2237', buyer: 'taras.shevchenko@gmail.com', seller: 'p.poroshenko@chocolate.ua', item: 'Юридичні послуги LEXAR', status: 'created', amount: 12000, date: '2026-06-02' },
  ];

  const defaultSimulatedSupport = [
    { id: 'sup-109', email: 'kovalchuk.marina@ukr.net', issue: 'Не підходить формат паспорта HEIC', status: lang === 'ua' ? 'Відкрито' : lang === 'ru' ? 'Открыто' : 'Open', time: "3 год тому" },
    { id: 'sup-108', email: 'taras.shevchenko@gmail.com', issue: 'Запит на створення акредитиву у UAH', status: lang === 'ua' ? 'Відкрито' : lang === 'ru' ? 'Открыто' : 'Open', time: "1 день тому" },
    { id: 'sup-107', email: 'vovchenko.oleg@gmail.com', issue: 'Як подати апеляцію щодо термінів доставки', status: lang === 'ua' ? 'Вирішено' : lang === 'ru' ? 'Решено' : 'Resolved', time: "3 дні тому" },
  ];

  // Primary state management with local persistence
  const [kyc, setKyc] = useState<KYCState>(() => {
    const saved = localStorage.getItem('kredo_kyc_state');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          documentType: 'passport',
          documentNumber: '',
          ...parsed
        };
      } catch (e) {}
    }
    return {
      status: 'Not Started',
      emailVerified: false,
      phoneVerified: false,
      passportName: null,
      passportSize: null,
      selfieName: null,
      selfieSize: null,
      reviewDate: null,
      adminNotes: null,
      documentType: 'passport',
      documentNumber: '',
    };
  });

  // OTP simulation states
  const [phoneInput, setPhoneInput] = useState(user.phone || '');
  const [otpSent, setOtpSent] = useState(false);
  const [otpInput, setOtpInput] = useState('');
  const [otpSuccess, setOtpSuccess] = useState(false);
  const [otpErrorFlag, setOtpErrorFlag] = useState(false);

  const [submissionLoading, setSubmissionLoading] = useState(false);
  const [submissionError, setSubmissionError] = useState('');
  const [submissionSuccess, setSubmissionSuccess] = useState('');

  // Active sub-view tab within the Admin desk overlay
  const [activeAdminTab, setActiveAdminTab] = useState<'users' | 'reviews' | 'transactions' | 'support'>('reviews');
  const [adminNotesInput, setAdminNotesInput] = useState('');

  // Local drag-and-drop file upload states
  const [isDragPassport, setIsDragPassport] = useState(false);
  const [isDragSelfie, setIsDragSelfie] = useState(false);
  const [passportFile, setPassportFile] = useState<File | null>(null);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);

  // Persist local state edits to localStorage
  useEffect(() => {
    localStorage.setItem('kredo_kyc_state', JSON.stringify(kyc));
  }, [kyc]);

  // Synchronize dynamic kyc status / notes from external changes (admin panel)
  useEffect(() => {
    if (user.kyc_status && user.kyc_status !== kyc.status) {
      setKyc(prev => ({
        ...prev,
        status: user.kyc_status!,
        adminNotes: user.kyc_notes || prev.adminNotes,
      }));
    }
  }, [user.kyc_status, user.kyc_notes]);

  // Synchronize top verified status with system profile
  useEffect(() => {
    const isVerified = kyc.status === 'Verified';
    if (user.verified !== isVerified) {
      updateProfile({ verified: isVerified });
    }
  }, [kyc.status, user.verified]);

  // Handle Drag events
  const handleDragOver = (e: React.DragEvent, section: 'passport' | 'selfie') => {
    e.preventDefault();
    if (section === 'passport') setIsDragPassport(true);
    if (section === 'selfie') setIsDragSelfie(true);
  };

  const handleDragLeave = (section: 'passport' | 'selfie') => {
    if (section === 'passport') setIsDragPassport(false);
    if (section === 'selfie') setIsDragSelfie(false);
  };

  const handleDrop = (e: React.DragEvent, section: 'passport' | 'selfie') => {
    e.preventDefault();
    handleDragLeave(section);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      const sizeStr = `${(file.size / (1024 * 1024)).toFixed(2)} MB`;
      
      if (section === 'passport') {
        setKyc(prev => ({ ...prev, passportName: file.name, passportSize: sizeStr }));
        setPassportFile(file);
      } else {
        setKyc(prev => ({ ...prev, selfieName: file.name, selfieSize: sizeStr }));
        setSelfieFile(file);
      }
    }
  };

  // Handle click manual inputs
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, section: 'passport' | 'selfie') => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const sizeStr = `${(file.size / (1024 * 1024)).toFixed(2)} MB`;
      
      if (section === 'passport') {
        setKyc(prev => ({ ...prev, passportName: file.name, passportSize: sizeStr }));
        setPassportFile(file);
      } else {
        setKyc(prev => ({ ...prev, selfieName: file.name, selfieSize: sizeStr }));
        setSelfieFile(file);
      }
    }
  };

  // Clean uploaded documents
  const clearFile = (section: 'passport' | 'selfie') => {
    if (section === 'passport') {
      setKyc(prev => ({ ...prev, passportName: null, passportSize: null }));
      setPassportFile(null);
    } else {
      setKyc(prev => ({ ...prev, selfieName: null, selfieSize: null }));
      setSelfieFile(null);
    }
  };

  // OTP key confirms
  const handleSendOtp = () => {
    if (!phoneInput) return;
    setOtpSent(true);
    setOtpErrorFlag(false);
  };

  const handleVerifyOtp = () => {
    if (otpInput === '1234') {
      setOtpSuccess(true);
      setOtpErrorFlag(false);
      setKyc(prev => ({ ...prev, phoneVerified: true }));
      updateProfile({ phone: phoneInput });
    } else {
      setOtpErrorFlag(true);
    }
  };

  // Submit Dossier
  const handleSubmitDossier = async () => {
    setSubmissionError('');
    setSubmissionSuccess('');
    if (!passportFile || !selfieFile || !kyc.documentNumber?.trim()) {
      setSubmissionError(lang === 'ua' ? 'Додайте документ, селфі та номер документа.' : lang === 'ru' ? 'Добавьте документ, селфи и номер документа.' : 'Add your document, selfie, and document number.');
      return;
    }
    setSubmissionLoading(true);
    try {
      const updatedStatus = 'Pending Review';
      const documentTypeVal = kyc.documentType || 'passport';
      const documentNumberVal = kyc.documentNumber || '';

      let passportUrl = kyc.passportName || 'passport_scan.jpg';
      let selfieUrl = kyc.selfieName || 'selfie_with_id.jpg';

      if (isSupabaseConfigured) {
        const result = await KredoData.submitKycRequest({
          user,
          documentType: documentTypeVal,
          documentNumber: documentNumberVal,
          passportFile,
          selfieFile,
        });
        if (!result.success) {
          const errorMessages = {
            ua: {
              bucket_missing: 'Приватне сховище KYC «kyc-documents» не налаштовано. Зверніться до підтримки.',
              network_error: 'Помилка мережі. Перевірте з’єднання та спробуйте ще раз.',
              default: 'Не вдалося зберегти KYC-заявку. Спробуйте ще раз.',
            },
            ru: {
              bucket_missing: 'Приватное хранилище KYC «kyc-documents» не настроено. Обратитесь в поддержку.',
              network_error: 'Ошибка сети. Проверьте подключение и попробуйте ещё раз.',
              default: 'Не удалось сохранить KYC-заявку. Попробуйте ещё раз.',
            },
            en: {
              bucket_missing: 'The private KYC storage bucket “kyc-documents” is not configured. Please contact support.',
              network_error: 'Network error. Check your connection and try again.',
              default: 'We could not save your KYC request. Please try again.',
            },
          }[lang];
          setSubmissionError(
            result.code === 'bucket_missing'
              ? errorMessages.bucket_missing
              : result.code === 'network_error'
                ? errorMessages.network_error
                : errorMessages.default
          );
          return;
        }
        passportUrl = result.passportPath || passportUrl;
        selfieUrl = result.selfiePath || selfieUrl;

        const accessKey = (import.meta as any).env?.VITE_WEB3FORMS_ACCESS_KEY?.trim();
        if (accessKey) {
          // This optional notice contains metadata only. KYC files and private paths are never emailed.
          void fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify({
              access_key: accessKey,
              subject: 'KREDO: new KYC request',
              name: user.fullName || user.email.split('@')[0],
              email: user.email,
              status: updatedStatus,
              created_date: result.createdAt || new Date().toISOString(),
              message: 'New KYC request was submitted.\nOpen admin panel to review documents.',
            }),
          }).catch(() => {
            // Notification delivery is optional and must never invalidate a stored KYC request.
          });
        }
      }

      setKyc(prev => {
      const nextKyc = {
        ...prev,
        status: updatedStatus,
        documentType: documentTypeVal,
        documentNumber: documentNumberVal,
        reviewDate: null,
        adminNotes: null
      };

      if (!isSupabaseConfigured) {
        const simulatedKycRequests = JSON.parse(localStorage.getItem('kredo_kyc_requests_db') || '[]');
        const existingIdx = simulatedKycRequests.findIndex((r: any) => r.user_id === user.id);
        const now = new Date().toISOString();
        const newRequest = {
          id: existingIdx !== -1 ? simulatedKycRequests[existingIdx].id : `kyc-${Date.now()}`,
          user_id: user.id,
          full_name: user.fullName || user.email.split('@')[0],
          email: user.email,
          document_type: documentTypeVal,
          document_number: documentNumberVal,
          document_front_url: passportUrl,
          selfie_url: selfieUrl,
          status: updatedStatus,
          admin_notes: '',
          created_at: now,
          updated_at: now,
        };
        if (existingIdx !== -1) simulatedKycRequests[existingIdx] = newRequest;
        else simulatedKycRequests.push(newRequest);
        localStorage.setItem('kredo_kyc_requests_db', JSON.stringify(simulatedKycRequests));
      }

      return nextKyc;
      });

      // Save user profile state
      updateProfile({ verified: false, kyc_status: updatedStatus, kyc_notes: '' });
      setSubmissionSuccess(lang === 'ua' ? 'Документи надіслано на перевірку' : lang === 'ru' ? 'Документы отправлены на проверку' : 'Documents submitted for review');
    } catch {
      setSubmissionError(
        lang === 'ua'
          ? 'Сталася помилка мережі. Спробуйте ще раз.'
          : lang === 'ru'
            ? 'Произошла ошибка сети. Попробуйте ещё раз.'
            : 'A network error occurred. Please try again.'
      );
    } finally {
      setSubmissionLoading(false);
    }
  };

  // Admin Actions to instantly evaluate request
  const handleAdminEvaluate = (status: 'Verified' | 'Rejected') => {
    setKyc(prev => ({
      ...prev,
      status: status,
      reviewDate: new Date().toISOString().replace('T', ' ').substring(0, 19),
      adminNotes: adminNotesInput.trim() ? adminNotesInput.trim() : (status === 'Verified' ? 'Verified successfully' : 'Please upload higher-contrast camera selfies')
    }));
    setAdminNotesInput('');
  };

  // Reset entire structure to Not Started for quick retry demo
  const handleResetDemoState = () => {
    localStorage.removeItem('kredo_kyc_state');
    setKyc({
      status: 'Not Started',
      emailVerified: false,
      phoneVerified: false,
      passportName: null,
      passportSize: null,
      selfieName: null,
      selfieSize: null,
      reviewDate: null,
      adminNotes: null,
    });
    setOtpSent(false);
    setOtpInput('');
    setOtpSuccess(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-5 sm:px-8 py-10 sm:py-14">
      {/* Main Grid Wrapper */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Client-Side KYC Dashboard */}
        <div className={user.role === 'admin' ? "lg:col-span-7 space-y-7" : "lg:col-span-12 max-w-4xl mx-auto w-full space-y-7"}>
          <div className="flex flex-col">
            <h1 className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${theme === 'dark' ? 'text-white' : 'text-stone-900'}`}>
              {t.title}
            </h1>
            <p className="text-sm sm:text-base text-stone-500 font-medium mt-2">
              {t.subtitle}
            </p>
          </div>

          {/* Current Status Banner Layout */}
          <div className={`p-6 rounded-3xl border ${
            kyc.status === 'Verified' 
              ? theme === 'dark' ? 'bg-emerald-950/20 border-emerald-550/25 text-emerald-400' : 'bg-emerald-500/5 border-emerald-100 text-emerald-700 shadow-sm'
              : kyc.status === 'Rejected'
                ? theme === 'dark' ? 'bg-rose-950/20 border-rose-500/20 text-rose-405' : 'bg-rose-50 border-rose-100 text-rose-700 shadow-sm'
                : kyc.status === 'Pending Review'
                  ? theme === 'dark' ? 'bg-amber-950/20 border-amber-500/20 text-amber-400' : 'bg-amber-50 border-amber-100 text-amber-700 shadow-sm'
                  : theme === 'dark' ? 'bg-stone-900/30 border-stone-850' : 'bg-stone-100/50 border-stone-200 text-stone-900 shadow-sm'
          }`}>
            <span className="block text-[10px] font-extrabold uppercase tracking-widest text-stone-500">
              {t.statusTitle}
            </span>
            <div className="flex items-center space-x-3 mt-2.5">
              <div className="p-2.5 rounded-full shrink-0">
                {kyc.status === 'Verified' && <ShieldCheck className="h-6 w-6 text-emerald-500" />}
                {kyc.status === 'Rejected' && <ShieldAlert className="h-6 w-6 text-red-500" />}
                {kyc.status === 'Pending Review' && <AlertTriangle className="h-6 w-6 text-amber-500" />}
                {kyc.status === 'Not Started' && <HelpCircle className="h-6 w-6 text-stone-400 animate-pulse" />}
              </div>
              <div className="flex-1">
                <p className="text-sm font-extrabold capitalize tracking-tight">
                  {kyc.status === 'Verified' && t.statusVerified}
                  {kyc.status === 'Rejected' && t.statusRejected}
                  {kyc.status === 'Pending Review' && t.statusPending}
                  {kyc.status === 'Not Started' && t.statusNotStarted}
                </p>
                {kyc.reviewDate && (
                  <p className="text-[10px] text-stone-500 font-semibold mt-1">
                    {t.reviewDateText} {kyc.reviewDate}
                  </p>
                )}
                {kyc.adminNotes && (
                  <div className={`mt-2.5 p-3 rounded-xl border text-[11px] font-semibold ${
                    theme === 'dark' ? 'bg-stone-950 border-stone-900 text-stone-400' : 'bg-white border-stone-200 text-stone-600 shadow-2xs'
                  }`}>
                    <span className="font-bold text-stone-550">{lang === 'ua' ? 'Коментар перевірки:' : lang === 'ru' ? 'Комментарий проверки:' : 'Review note:'}</span> {kyc.adminNotes}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Interactive Compliance Section Tabs */}
          {kyc.status === 'Verified' ? (
            <div className={`rounded-3xl p-6 border text-center ${
              theme === 'dark' ? 'bg-[#0b0c05] border-emerald-950' : 'bg-emerald-500/5 border-emerald-100 shadow-sm'
            }`}>
              <ShieldCheck className="h-12 w-12 text-emerald-500 mx-auto mb-4" />
              <h3 className={`text-md font-bold ${theme === 'dark' ? 'text-white' : 'text-stone-900'}`}>
                {t.verifiedSuccessTitle}
              </h3>
              <p className="text-xs text-stone-500 font-medium leading-relaxed max-w-sm mx-auto mt-2">
                {t.verifiedSuccessText}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              
              {/* Step 1: Email verification */}
              <div className={`p-5 rounded-2xl border ${
                theme === 'dark' ? 'bg-stone-900/10 border-stone-900' : 'bg-white border-stone-200 text-stone-900 shadow-sm'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs font-extrabold uppercase tracking-wider ${theme === 'dark' ? 'text-stone-300' : 'text-stone-850'}`}>
                    {t.emailStep}
                  </span>
                  {user.emailVerified ? (
                    <span className="text-[10px] font-extrabold uppercase bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-full flex items-center space-x-1">
                      <Check className="h-3 w-3" />
                      <span>{lang === 'ua' ? 'Підтверджено' : lang === 'ru' ? 'Подтверждено' : 'Verified'}</span>
                    </span>
                  ) : (
                    <span className="text-[10px] font-extrabold uppercase bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded-full">
                      {lang === 'ua' ? 'Потрібно підтвердити' : lang === 'ru' ? 'Требуется подтвердить' : 'Required'}
                    </span>
                  )}
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-3.5 mt-3">
                  <div className="relative flex-1">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-550" />
                    <input 
                      type="text" 
                      value={user.email} 
                      disabled 
                      className={`w-full text-xs font-semibold pl-9 pr-3 py-2.5 rounded-xl border select-none opacity-80 ${
                        theme === 'dark' ? 'bg-stone-950 border-stone-900 text-stone-400' : 'bg-stone-50 border-stone-200 text-stone-650'
                      }`}
                    />
                  </div>
                  {!user.emailVerified && (
                    <span className="rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-2.5 text-[11px] font-bold text-amber-500">
                      {lang === 'ua' ? 'Підтвердьте email під час входу' : lang === 'ru' ? 'Подтвердите email при входе' : 'Verify your email during sign-in'}
                    </span>
                  )}
                </div>
              </div>
              
              {/* Step 2: Passport Document drag & drop upload */}
              <div className={`p-5 rounded-2xl border ${
                theme === 'dark' ? 'bg-stone-900/10 border-stone-900' : 'bg-white border-stone-200 text-stone-900 shadow-sm'
              }`}>
                <div className="flex items-center justify-between mb-4">
                  <span className={`text-xs font-extrabold uppercase tracking-wider ${theme === 'dark' ? 'text-stone-300' : 'text-stone-850'}`}>
                    {t.passportStep}
                  </span>
                  {kyc.passportName ? (
                    <span className="text-[10px] font-extrabold uppercase bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-full flex items-center space-x-1">
                      <Check className="h-3 w-3" />
                      <span>{lang === 'ua' ? 'Файл завантажено' : lang === 'ru' ? 'Файл загружен' : 'Ready'}</span>
                    </span>
                  ) : (
                    <span className="text-[10px] font-extrabold uppercase bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded-full">
                      {lang === 'ua' ? 'Очікує файл' : lang === 'ru' ? 'Ожидает файл' : 'Upload Needed'}
                    </span>
                  )}
                </div>

                {kyc.passportName ? (
                  <div className={`p-4 rounded-xl border flex items-center justify-between ${
                    theme === 'dark' ? 'bg-stone-950 border-stone-900 text-white' : 'bg-stone-50 border-stone-200 text-stone-900 shadow-3xs'
                  }`}>
                    <div className="flex items-center space-x-3.5 min-w-0">
                      <FileText className="h-5 w-5 text-emerald-500 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs font-extrabold truncate">{kyc.passportName}</p>
                        <p className="text-[10px] text-stone-500 font-semibold mt-0.5">{kyc.passportSize}</p>
                      </div>
                    </div>
                    <button onClick={() => clearFile('passport')} className="text-stone-500 hover:text-red-500 p-1">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div
                    onDragOver={(e) => handleDragOver(e, 'passport')}
                    onDragLeave={() => handleDragLeave('passport')}
                    onDrop={(e) => handleDrop(e, 'passport')}
                    className={`p-6 border-2 border-dashed rounded-xl text-center cursor-pointer transition-all ${
                      isDragPassport 
                        ? 'border-emerald-500 bg-emerald-500/5' 
                        : theme === 'dark' ? 'border-stone-800 bg-stone-950 hover:border-stone-700' : 'border-stone-300 bg-stone-50 hover:border-stone-400'
                    }`}
                  >
                    <input 
                      type="file" 
                      id="kyc-passport" 
                      className="hidden" 
                      accept="image/*,application/pdf"
                      onChange={(e) => handleFileChange(e, 'passport')}
                    />
                    <label htmlFor="kyc-passport" className="cursor-pointer">
                      <UploadCloud className="h-8 w-8 text-stone-500 mx-auto mb-2" />
                      <p className="text-[11px] font-extrabold text-stone-500 uppercase tracking-widest">{t.dragLabel}</p>
                      <p className="text-[9px] text-stone-550 font-bold mt-1.5">PDF, PNG, JPG ({lang === 'ua' ? 'до' : lang === 'ru' ? 'до' : 'max'} 10 MB)</p>
                    </label>
                  </div>
                )}

                {/* Sub-inputs: Document Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5 pt-4 border-t border-stone-500/10">
                  <div>
                    <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1.5 ${
                      theme === 'dark' ? 'text-stone-500' : 'text-stone-400'
                    }`}>
                      {lang === 'ua' ? 'Тип документа' : lang === 'ru' ? 'Тип документа' : 'Document Type'}
                    </label>
                    <select
                      value={kyc.documentType || 'passport'}
                      onChange={(e) => setKyc(prev => ({ ...prev, documentType: e.target.value }))}
                      className={`w-full text-xs font-semibold px-4 py-2.5 rounded-xl border transition-all ${
                        theme === 'dark'
                          ? 'bg-stone-950 border-stone-900 text-white focus:border-stone-500'
                          : 'bg-stone-50 border-stone-200 text-stone-900 focus:border-stone-950'
                      }`}
                    >
                      <option value="passport">{lang === 'ua' ? 'Паспорт громадянина / ID' : lang === 'ru' ? 'Паспорт гражданина / ID' : 'Passport / National ID Card'}</option>
                      <option value="driver">{lang === 'ua' ? 'Посвідчення водія' : lang === 'ru' ? 'Водительское удостоверение' : 'Driver License'}</option>
                      <option value="international">{lang === 'ua' ? 'Закордонний паспорт' : lang === 'ru' ? 'Загранпаспорт' : 'International Passport'}</option>
                    </select>
                  </div>
                  <div>
                    <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1.5 ${
                      theme === 'dark' ? 'text-stone-500' : 'text-stone-400'
                    }`}>
                      {lang === 'ua' ? 'Номер документа' : lang === 'ru' ? 'Номер документа' : 'Document Number'}
                    </label>
                    <input
                      type="text"
                      placeholder="MT123456"
                      value={kyc.documentNumber || ''}
                      onChange={(e) => setKyc(prev => ({ ...prev, documentNumber: e.target.value }))}
                      className={`w-full text-xs font-semibold px-4 py-2.5 rounded-xl border transition-all uppercase ${
                        theme === 'dark'
                          ? 'bg-stone-950 border-stone-900 text-white focus:border-stone-500'
                          : 'bg-stone-50 border-stone-200 text-stone-900 focus:border-stone-950'
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* Step 4: Selfie upload with drag & drop */}
              <div className={`p-5 rounded-2xl border ${
                theme === 'dark' ? 'bg-stone-900/10 border-stone-900' : 'bg-white border-stone-200 text-stone-900 shadow-sm'
              }`}>
                <div className="flex items-center justify-between mb-4">
                  <span className={`text-xs font-extrabold uppercase tracking-wider ${theme === 'dark' ? 'text-stone-300' : 'text-stone-850'}`}>
                    {t.selfieStep}
                  </span>
                  {kyc.selfieName ? (
                    <span className="text-[10px] font-extrabold uppercase bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-full flex items-center space-x-1">
                      <Check className="h-3 w-3" />
                      <span>{lang === 'ua' ? 'Файл завантажено' : lang === 'ru' ? 'Файл загружен' : 'Ready'}</span>
                    </span>
                  ) : (
                    <span className="text-[10px] font-extrabold uppercase bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded-full">
                      {lang === 'ua' ? 'Очікує файл' : lang === 'ru' ? 'Ожидает файл' : 'Upload Needed'}
                    </span>
                  )}
                </div>

                {kyc.selfieName ? (
                  <div className={`p-4 rounded-xl border flex items-center justify-between ${
                    theme === 'dark' ? 'bg-stone-950 border-stone-900 text-white' : 'bg-stone-50 border-stone-200 text-stone-900 shadow-3xs'
                  }`}>
                    <div className="flex items-center space-x-3.5 min-w-0">
                      <FileText className="h-5 w-5 text-emerald-500 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs font-extrabold truncate">{kyc.selfieName}</p>
                        <p className="text-[10px] text-stone-500 font-semibold mt-0.5">{kyc.selfieSize}</p>
                      </div>
                    </div>
                    <button onClick={() => clearFile('selfie')} className="text-stone-500 hover:text-red-500 p-1">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div
                    onDragOver={(e) => handleDragOver(e, 'selfie')}
                    onDragLeave={() => handleDragLeave('selfie')}
                    onDrop={(e) => handleDrop(e, 'selfie')}
                    className={`p-6 border-2 border-dashed rounded-xl text-center cursor-pointer transition-all ${
                      isDragSelfie 
                        ? 'border-emerald-500 bg-emerald-500/5' 
                        : theme === 'dark' ? 'border-stone-800 bg-stone-950 hover:border-stone-700' : 'border-stone-300 bg-stone-50 hover:border-stone-400'
                    }`}
                  >
                    <input 
                      type="file" 
                      id="kyc-selfie" 
                      className="hidden" 
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, 'selfie')}
                    />
                    <label htmlFor="kyc-selfie" className="cursor-pointer">
                      <UploadCloud className="h-8 w-8 text-stone-500 mx-auto mb-2" />
                      <p className="text-[11px] font-extrabold text-stone-500 uppercase tracking-widest">{t.dragLabel}</p>
                      <p className="text-[9px] text-stone-550 font-bold mt-1.5">PNG, JPG ({lang === 'ua' ? 'до' : lang === 'ru' ? 'до' : 'max'} 5 MB)</p>
                    </label>
                  </div>
                )}
              </div>

              {/* Action Button: Submit Audit */}
              {submissionError && (
                <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-5 py-4 text-sm font-semibold text-rose-500">
                  {submissionError}
                </div>
              )}
              {submissionSuccess && (
                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-5 py-4 text-sm font-semibold text-emerald-600">
                  {submissionSuccess}
                </div>
              )}
              {kyc.status !== 'Pending Review' && (
                <button
                  onClick={handleSubmitDossier}
                  disabled={!user.emailVerified || !kyc.passportName || !kyc.selfieName || !kyc.documentNumber?.trim() || submissionLoading}
                  className={`w-full text-xs font-black uppercase tracking-wider py-4 rounded-2xl flex items-center justify-center space-x-2 transition-all ${
                    (user.emailVerified && kyc.passportName && kyc.selfieName && kyc.documentNumber?.trim() && !submissionLoading)
                      ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-md cursor-pointer'
                      : 'bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-850 text-stone-400 select-none cursor-not-allowed'
                  }`}
                >
                  <ShieldCheck className="h-4 w-4 shrink-0" />
                  <span>
                    {submissionLoading
                      ? (lang === 'ua' ? 'Надсилання…' : lang === 'ru' ? 'Отправка…' : 'Submitting…')
                      : t.submitBtn}
                  </span>
                </button>
              )}
            </div>
          )}

          {/* Guidelines Alert Infobox */}
          <div className={`p-5 rounded-2xl border ${
            theme === 'dark' ? 'bg-[#0b0b0f] border-indigo-950 text-indigo-400' : 'bg-sky-50 border-sky-100 text-sky-700 shadow-sm'
          }`}>
            <h4 className="text-xs font-black uppercase tracking-widest">{t.riskAlertTitle}</h4>
            <p className={`text-[11px] mt-2 leading-relaxed font-semibold ${theme === 'dark' ? 'text-stone-400' : 'text-stone-605'}`}>
              {t.riskAlertText}
            </p>
          </div>

        </div>

        {/* Right Side: Back-Office Admin Panel Simulator Workspace */}
        {false && user.role === 'admin' && (
          <div className="lg:col-span-5 space-y-6">
            <div className="flex items-center justify-between space-x-2.5">
              <div className="flex items-center space-x-2.5">
                <span className="h-3 w-3 rounded-full bg-emerald-500 animate-ping"></span>
                <span className={`text-[10px] uppercase font-bold tracking-widest transition-all ${theme === 'dark' ? 'text-stone-400' : 'text-stone-700'}`}>
                  🛠️ Адміністративна панель KREDO
                </span>
              </div>
            </div>

          <div className={`rounded-3xl border overflow-hidden ${
            theme === 'dark' ? 'bg-stone-900 border-stone-800 shadow-xl' : 'bg-white border-stone-200 shadow-lg mt-4'
          }`}>
            {/* Header banner tab of administration */}
            <div className={`px-6 py-5 border-b select-none ${theme === 'dark' ? 'bg-stone-800/40 border-stone-700' : 'bg-stone-50 border-stone-200'}`}>
              <h3 className={`text-xs font-black uppercase tracking-widest ${theme === 'dark' ? 'text-white' : 'text-stone-950'}`}>
                {t.adminTitle}
              </h3>
              <p className="text-[10px] font-semibold text-stone-500 mt-1">
                {lang === 'ua' ? 'Адміністрування KYC, рахунків та лімітів KREDO' : 'Administrative hub for audit authorization compliance'}
              </p>
            </div>

            {/* Admin Desk Navigation tabs */}
            <div className="flex border-b border-stone-500/10 bg-stone-500/2.5">
              <button 
                onClick={() => setActiveAdminTab('reviews')}
                className={`flex-1 text-[10px] uppercase tracking-wider font-extrabold py-3 border-b-2 hover:bg-stone-500/5 transition-all ${
                  activeAdminTab === 'reviews' 
                    ? 'border-emerald-500 text-emerald-500' 
                    : 'border-transparent text-stone-500'
                }`}
              >
                {t.adminReviews}
              </button>
              <button 
                onClick={() => setActiveAdminTab('users')}
                className={`flex-1 text-[10px] uppercase tracking-wider font-extrabold py-3 border-b-2 hover:bg-stone-500/5 transition-all ${
                  activeAdminTab === 'users' 
                    ? 'border-emerald-500 text-emerald-500' 
                    : 'border-transparent text-stone-500'
                }`}
              >
                {t.adminUsers}
              </button>
              <button 
                onClick={() => setActiveAdminTab('transactions')}
                className={`flex-1 text-[10px] uppercase tracking-wider font-extrabold py-3 border-b-2 hover:bg-stone-500/5 transition-all ${
                  activeAdminTab === 'transactions' 
                    ? 'border-emerald-500 text-emerald-500' 
                    : 'border-transparent text-stone-500'
                }`}
              >
                {t.adminTransactions}
              </button>
              <button 
                onClick={() => setActiveAdminTab('support')}
                className={`flex-1 text-[10px] uppercase tracking-wider font-extrabold py-3 border-b-2 hover:bg-stone-500/5 transition-all ${
                  activeAdminTab === 'support' 
                    ? 'border-emerald-500 text-emerald-500' 
                    : 'border-transparent text-stone-500'
                }`}
              >
                {t.adminSupport}
              </button>
            </div>

            {/* Workspace Tab rendering views */}
            <div className="p-6">
              
              {/* Reviews Queue Moderation (Main panel) */}
              {activeAdminTab === 'reviews' && (
                <div className="space-y-4 animate-fade-in">
                  <div className={`p-4 rounded-2xl border text-xs leading-relaxed font-semibold text-stone-500 ${
                    theme === 'dark' ? 'bg-stone-800/30 border-stone-700 text-stone-300' : 'bg-stone-50 border-stone-200'
                  }`}>
                    {kyc.status === 'Pending Review' ? (
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2.5 text-amber-500">
                          <Eye className="h-4 w-4 shrink-0 animate-pulse" />
                          <span className="font-extrabold uppercase tracking-wider">
                            {lang === 'ua' ? 'Надійшов новий запит на аудит' : lang === 'ru' ? 'Поступил новый запрос на аудит' : 'Audit request queued'}
                          </span>
                        </div>
                        <p className="text-[11px] leading-relaxed">
                          🧑‍💼 <span className="font-bold text-stone-650">{lang === 'ua' ? 'Заявник:' : lang === 'ru' ? 'Заявитель:' : 'Applicant:'}</span> {user.fullName} ({user.email})
                        </p>
                        <div className="grid grid-cols-2 gap-2 text-[10px] border-t border-dashed border-stone-500/10 pt-3">
                          <div className="p-2 bg-stone-500/5 rounded-lg">
                            <span className="block text-stone-500 uppercase tracking-widest font-extrabold">{lang === 'ua' ? 'Файл паспорта' : lang === 'ru' ? 'Файл паспорта' : 'Passport file'}</span>
                            <span className="block font-bold truncate mt-1 text-emerald-505">📄 {kyc.passportName}</span>
                          </div>
                          <div className="p-2 bg-stone-500/5 rounded-lg">
                            <span className="block text-stone-500 uppercase tracking-widest font-extrabold">{lang === 'ua' ? 'Файл селфі' : lang === 'ru' ? 'Файл селфи' : 'Selfie file'}</span>
                            <span className="block font-bold truncate mt-1 text-emerald-505">📷 {kyc.selfieName}</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-6 text-stone-550">
                        <ShieldCheck className="h-8 w-8 text-stone-400 mx-auto mb-2" />
                        <span className="block font-extrabold uppercase tracking-widest text-[10px]">
                          {lang === 'ua' ? 'Немає активних запитів' : lang === 'ru' ? 'Нет активных запросов' : 'No active requests'}
                        </span>
                        <p className="text-[10px] text-stone-500 font-semibold mt-1">
                          {lang === 'ua' ? 'Завантажте та надішліть заявку зліва' : lang === 'ru' ? 'Загрузите и отправьте заявку слева' : 'Complete the step-by-step checklist on the left and submit.'}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Feedback Comments Box and Decision Controls */}
                  <div className="space-y-3.5">
                    <label className={`block text-[10px] font-extrabold uppercase tracking-widest text-stone-500`}>
                      {lang === 'ua' ? 'Рішення та супровідний коммент' : lang === 'ru' ? 'Решение и сопроводительный коммент' : 'Moderation Remarks & Verdict'}
                    </label>
                    <textarea 
                      value={adminNotesInput}
                      onChange={(e) => setAdminNotesInput(e.target.value)}
                      placeholder={t.notesPlaceholder}
                      className={`w-full text-xs font-semibold p-3 rounded-xl border focus:outline-hidden min-h-[70px] ${
                        theme === 'dark'
                          ? 'bg-stone-950 border-stone-700 text-white focus:border-stone-500'
                          : 'bg-stone-50 border-stone-200 text-stone-900 focus:border-stone-900 shadow-2xs'
                      }`}
                    />

                    <div className="grid grid-cols-2 gap-3.5">
                      <button
                        onClick={() => handleAdminEvaluate('Verified')}
                        disabled={kyc.status !== 'Pending Review'}
                        className={`text-[10px] uppercase font-black tracking-widest py-3 px-3 rounded-xl flex items-center justify-center space-x-2 transition-all ${
                          kyc.status === 'Pending Review'
                            ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm cursor-pointer'
                            : 'bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-400 select-none cursor-not-allowed'
                        }`}
                      >
                        <UserCheck className="h-3.5 w-3.5" />
                        <span>{t.approveBtn}</span>
                      </button>
                      <button
                        onClick={() => handleAdminEvaluate('Rejected')}
                        disabled={kyc.status !== 'Pending Review'}
                        className={`text-[10px] uppercase font-black tracking-widest py-3 px-3 rounded-xl flex items-center justify-center space-x-2 transition-all ${
                          kyc.status === 'Pending Review'
                            ? 'bg-red-500 hover:bg-red-600 text-white shadow-sm cursor-pointer'
                            : 'bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-400 select-none cursor-not-allowed'
                        }`}
                      >
                        <X className="h-3.5 w-3.5" />
                        <span>{t.rejectBtn}</span>
                      </button>
                    </div>

                    <div className="p-3.5 rounded-xl border-t border-dashed border-stone-550/15 text-[10px] text-stone-500 font-bold leading-relaxed">
                      💡 <span className="text-stone-650">{lang === 'ua' ? 'Примітка для адміна:' : lang === 'ru' ? 'Примечание для админа:' : 'Admin sandbox note:'}</span> {lang === 'ua' ? 'Ви можете верифікувати або відхилити вашу власну заявку.' : lang === 'ru' ? 'Вы можете верифицировать или отклонить вашу собственную заявку.' : 'You can verify or reject your own submissions instantly!'}
                    </div>
                  </div>
                </div>
              )}

              {/* Users Base Grid Directory (Bento grid stats layout) */}
              {activeAdminTab === 'users' && (
                <div className="space-y-4 animate-fade-in text-xs">
                  <div className="grid grid-cols-2 gap-3 mb-2">
                    <div className={`p-3 rounded-xl border ${theme === 'dark' ? 'bg-stone-800/30 border-stone-700 text-white' : 'bg-stone-50 border-stone-200'}`}>
                      <span className="block text-[8px] uppercase tracking-widest text-stone-500 font-extrabold">{t.usersCount}</span>
                      <span className="block text-md font-extrabold mt-1">5</span>
                    </div>
                    <div className={`p-3 rounded-xl border ${theme === 'dark' ? 'bg-stone-800/30 border-stone-700 text-white' : 'bg-stone-50 border-stone-200'}`}>
                      <span className="block text-[8px] uppercase tracking-widest text-stone-500 font-extrabold">{lang === 'ua' ? 'AML Схвалено' : lang === 'ru' ? 'AML Одобрено' : 'AML Cleared verified'}</span>
                      <span className="block text-md font-extrabold mt-1 text-emerald-555">2</span>
                    </div>
                  </div>

                  <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                    {(!defaultSimulatedUsers || defaultSimulatedUsers.length === 0) ? (
                      <div className="text-center py-6 text-stone-550 border rounded-xl border-dashed">
                        <span className="block font-extrabold uppercase tracking-widest text-[10px]">
                          {lang === 'ua' ? 'Немає користувачів' : lang === 'ru' ? 'Нет пользователей' : 'No users found'}
                        </span>
                      </div>
                    ) : (
                      defaultSimulatedUsers.map((u) => (
                        <div key={u.id} className={`p-3 rounded-xl border flex items-center justify-between ${
                          theme === 'dark' ? 'bg-stone-800/40 border-stone-700 text-stone-200' : 'bg-white border-stone-150 shadow-3xs'
                        }`}>
                          <div>
                            <p className="font-extrabold tracking-tight">{u.fullName}</p>
                            <p className="text-[10px] text-stone-500 font-semibold">{u.email}</p>
                          </div>
                          <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                            u.kycState === 'Verified' || u.kycState === 'Верифіковано' || u.kycState === 'Верифицировано'
                              ? 'bg-emerald-500/10 text-emerald-500' 
                              : u.kycState === 'Rejected' || u.kycState === 'Відхилено' || u.kycState === 'Отклонено'
                                ? 'bg-rose-500/10 text-rose-500'
                                : u.kycState === 'Pending Review' || u.kycState === 'Перевіряється' || u.kycState === 'Проверяется'
                                  ? 'bg-amber-500/10 text-amber-500'
                                  : 'bg-stone-500/10 text-stone-500'
                          }`}>
                            {u.kycState}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Transactions Escrow Ledger view */}
              {activeAdminTab === 'transactions' && (
                <div className="space-y-4 animate-fade-in text-xs font-semibold">
                  <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
                    {(!defaultSimulatedLedger || defaultSimulatedLedger.length === 0) ? (
                      <div className="text-center py-6 text-stone-550 border rounded-xl border-dashed">
                        <span className="block font-extrabold uppercase tracking-widest text-[10px]">
                          {lang === 'ua' ? 'Немає транзакцій' : lang === 'ru' ? 'Нет транзакций' : 'No transactions found'}
                        </span>
                      </div>
                    ) : (
                      defaultSimulatedLedger.map((tx) => (
                        <div key={tx.id} className={`p-3.5 rounded-xl border ${
                          theme === 'dark' ? 'bg-stone-800/40 border-stone-700 text-stone-200' : 'bg-white border-stone-150 shadow-3xs'
                        }`}>
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-[9px] text-stone-500 font-extrabold">{tx.id}</span>
                            <span className="font-bold text-stone-850">UAH {(tx.amount || 0).toLocaleString()}</span>
                          </div>
                          <p className="mt-1 text-[11px] font-bold text-stone-700 truncate">{tx.item}</p>
                          <div className="flex items-center justify-between border-t border-dashed border-stone-500/10 mt-2 pt-1.5 text-[9px] text-stone-500">
                            <span className="truncate max-w-[120px]">{lang === 'ua' ? 'Покупець:' : lang === 'ru' ? 'Покупатель:' : 'Buyer:'} {tx.buyer}</span>
                            <span className={`uppercase font-black tracking-widest ${
                              tx.status === 'released' ? 'text-emerald-500' : 'text-amber-500'
                            }`}>{tx.status}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Support Requests tickets queue */}
              {activeAdminTab === 'support' && (
                <div className="space-y-4 animate-fade-in text-xs font-semibold">
                  <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
                    {(!defaultSimulatedSupport || defaultSimulatedSupport.length === 0) ? (
                      <div className="text-center py-6 text-stone-550 border rounded-xl border-dashed">
                        <span className="block font-extrabold uppercase tracking-widest text-[10px]">
                          {lang === 'ua' ? 'Немає запитів' : lang === 'ru' ? 'Нет запросов' : 'No tickets found'}
                        </span>
                      </div>
                    ) : (
                      defaultSimulatedSupport.map((ticket) => (
                        <div key={ticket.id} className={`p-3 rounded-xl border flex items-center justify-between ${
                          theme === 'dark' ? 'bg-stone-800/40 border-stone-700 text-stone-200' : 'bg-white border-stone-150 shadow-3xs'
                        }`}>
                          <div className="min-w-0 flex-1 pr-3">
                            <p className="font-bold tracking-tight text-stone-850 truncate">{ticket.issue}</p>
                            <p className="text-[10px] text-stone-500 font-semibold mt-0.5 truncate">{ticket.email}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                              ticket.status === 'Open' || ticket.status === 'Відкрито' || ticket.status === 'Открыто' ? 'bg-rose-500/10 text-rose-500' : 'bg-stone-500/10 text-stone-500'
                            }`}>
                              {ticket.status}
                            </span>
                            <p className="text-[8px] text-stone-500 font-semibold mt-1">{ticket.time}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
        )}

      </div>
    </div>
  );
}
