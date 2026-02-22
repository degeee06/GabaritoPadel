import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { X, Check, Copy, Loader2 } from 'lucide-react';
import { createPremiumPayment, checkPaymentStatus } from '../services/payment';

interface UpgradeModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function UpgradeModal({ onClose, onSuccess }: UpgradeModalProps) {
  const [step, setStep] = useState<'form' | 'payment'>('form');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [qrCodeBase64, setQrCodeBase64] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    cpf: '',
    phone: ''
  });

  const pollingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGeneratePix = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await createPremiumPayment(formData.cpf, formData.name, formData.phone);
      setQrCode(result.qr_code);
      setQrCodeBase64(result.qr_code_base64);
      setStep('payment');
      
      startPolling(result.id);
    } catch (err: any) {
      setError(err.message || 'Erro ao gerar Pix. Verifique os dados.');
    } finally {
      setLoading(false);
    }
  };

  const startPolling = (pid: string) => {
    if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);

    pollingIntervalRef.current = setInterval(async () => {
      try {
        const status = await checkPaymentStatus(pid);
        if (status === 'approved') {
          if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
          onSuccess(); 
        }
      } catch (e) {
        console.error('Polling error', e);
      }
    }, 5000); 
  };

  const copyToClipboard = () => {
    if (qrCode) {
      navigator.clipboard.writeText(qrCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClose = () => {
    if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-zinc-900 border border-lime-500/30 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl"
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">Upgrade <span className="text-lime-400">PRO</span></h2>
            <button onClick={handleClose} className="text-zinc-400 hover:text-white">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="mb-6">
            <p className="text-zinc-300 text-sm mb-4">
              Você atingiu seu limite de análises.
            </p>
            <p className="text-zinc-400 text-xs mb-4">
              Faça o upgrade para continuar evoluindo seu jogo agora mesmo com uma margem segura e de alta performance!
            </p>
            <ul className="space-y-2 mb-6">
              <li className="flex items-center gap-2 text-zinc-400 text-sm">
                <Check className="w-4 h-4 text-lime-400" />
                Até 100 análises táticas por mês
              </li>
              <li className="flex items-center gap-2 text-zinc-400 text-sm">
                <Check className="w-4 h-4 text-lime-400" />
                Acesso a estratégias avançadas
              </li>
              <li className="flex items-center gap-2 text-zinc-400 text-sm">
                <Check className="w-4 h-4 text-lime-400" />
                Suporte prioritário
              </li>
            </ul>
            <div className="bg-zinc-800/50 p-4 rounded-lg border border-zinc-700 text-center">
              <span className="text-zinc-400 text-sm">Acesso de 30 dias por apenas</span>
              <div className="text-3xl font-bold text-white">R$ 9,90</div>
            </div>
          </div>

          {step === 'form' ? (
            <form onSubmit={handleGeneratePix} className="space-y-4">
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Nome Completo</label>
                <input 
                  type="text" 
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-white focus:border-lime-500 outline-none transition-colors"
                  placeholder="Seu nome"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">CPF (Apenas números)</label>
                <input 
                  type="text" 
                  name="cpf"
                  required
                  value={formData.cpf}
                  onChange={handleInputChange}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-white focus:border-lime-500 outline-none transition-colors"
                  placeholder="000.000.000-00"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Celular</label>
                <input 
                  type="tel" 
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-white focus:border-lime-500 outline-none transition-colors"
                  placeholder="(00) 00000-0000"
                />
              </div>

              {error && <div className="text-red-400 text-sm text-center">{error}</div>}

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-lime-400 hover:bg-lime-500 text-zinc-900 font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Gerar Pix para Pagamento'}
              </button>
            </form>
          ) : (
            <div className="text-center space-y-6">
              <div className="bg-white p-4 rounded-lg inline-block">
                {qrCodeBase64 ? (
                  <img src={`data:image/png;base64,${qrCodeBase64}`} alt="QR Code Pix" className="w-48 h-48" />
                ) : (
                  <div className="w-48 h-48 bg-zinc-200 animate-pulse" />
                )}
              </div>
              
              <div className="space-y-2">
                <p className="text-zinc-400 text-sm">Escaneie o QR Code ou copie o código abaixo:</p>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    readOnly 
                    value={qrCode || ''} 
                    className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-400 truncate"
                  />
                  <button 
                    onClick={copyToClipboard}
                    className="bg-zinc-700 hover:bg-zinc-600 text-white p-2 rounded-lg transition-colors"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-center gap-2 text-lime-400 text-sm animate-pulse">
                <Loader2 className="w-4 h-4 animate-spin" />
                Aguardando pagamento...
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}