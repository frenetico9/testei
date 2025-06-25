
import React, { useEffect, useState, useCallback, useMemo } from 'react'; 
import { supabase } from '../../services/supabaseService';
import { Review as ReviewType } from '../../types'; 
import { useAuth } from '../../hooks/useAuth';
import Table, { ColumnDefinition } from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Card from '../../components/ui/Card';
import StarRating from '../../components/ui/StarRating';
import { CheckCircle, XCircle, Eye, AlertTriangle } from 'lucide-react';

const ManageReviewsPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [reviews, setReviews] = useState<ReviewType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<ReviewType | null>(null);

  const fetchReviews = useCallback(async () => {
     if (!currentUser || !currentUser.barbershopId) {
        setError("Usuário ou barbearia não identificados.");
        setLoading(false);
        return;
    }
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from<ReviewType>('reviews')
        .eq('barbershopId', currentUser.barbershopId)
        .select('*');
      if (fetchError) throw fetchError;
      
      setReviews((data || []).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch (err: any) {
      setError(err.message || "Erro ao buscar avaliações.");
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const openReviewModal = (review: ReviewType) => {
    setSelectedReview(review);
    setIsModalOpen(true);
  };

  const closeReviewModal = () => {
    setIsModalOpen(false);
    setSelectedReview(null);
  };

  const handleApproveReview = async (reviewId: string, approve: boolean) => {
    setLoading(true);
    setError(null);
    try {
      const { error: updateError } = await supabase
        .from<ReviewType>('reviews')
        .update({ isApproved: approve })
        .eq('id', reviewId);

      if (updateError) throw updateError;
      await fetchReviews();
    } catch (err: any) {
      setError(err.message || `Erro ao ${approve ? 'aprovar' : 'reprovar'} avaliação.`);
    } finally {
      setLoading(false);
      closeReviewModal(); 
    }
  };
  
  const averageRating = useMemo(() => {
    const approvedReviews = reviews.filter(r => r.isApproved);
    if (approvedReviews.length === 0) return 0;
    return approvedReviews.reduce((sum, r) => sum + r.rating, 0) / approvedReviews.length;
  }, [reviews]);


  const columns: ColumnDefinition<ReviewType>[] = [
    { key: 'clientName', header: 'Cliente' },
    { key: 'serviceName', header: 'Serviço' },
    { key: 'barberName', header: 'Barbeiro' },
    { key: 'rating', header: 'Nota', render: (r) => <StarRating rating={r.rating} readOnly size={16} color="text-yellow-400" /> },
    { 
      key: 'comment', 
      header: 'Comentário', 
      render: (r) => <p className="truncate max-w-xs">{r.comment}</p> 
    },
    { 
      key: 'isApproved', 
      header: 'Status', 
      render: (r) => (
        r.isApproved 
          ? <span className="text-xs px-2 py-0.5 rounded-full bg-green-700 text-green-200">Aprovada</span> 
          : <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-700 text-yellow-200">Pendente</span>
      )
    },
    { 
      key: 'actions', 
      header: 'Ações', 
      render: (r) => (
        <div className="space-x-2">
          <Button variant="outline" size="small" onClick={() => openReviewModal(r)} title="Ver Detalhes"><Eye size={14} /></Button>
          {!r.isApproved && (
            <Button variant="primary" className="bg-green-600 hover:bg-green-700" size="small" onClick={() => handleApproveReview(r.id, true)} title="Aprovar">
              <CheckCircle size={14} />
            </Button>
          )}
           {r.isApproved && ( 
            <Button variant="danger" size="small" onClick={() => handleApproveReview(r.id, false)} title="Reprovar/Ocultar">
              <XCircle size={14} />
            </Button>
          )}
        </div>
      )
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-roboto-slab font-bold text-branco-nav">Gerenciar Avaliações</h1>
      
      {error && <div className="bg-red-900 bg-opacity-50 text-red-300 p-3 rounded-md flex items-center"><AlertTriangle size={18} className="mr-2"/>{error}</div>}

      <Card>
        <div className="p-4 mb-4 bg-cinza-fundo-elemento bg-opacity-30 rounded-md border border-cinza-borda">
            <h3 className="text-lg font-semibold text-branco-nav">Média Geral das Avaliações Aprovadas</h3>
            <div className="flex items-center mt-1">
                <StarRating rating={averageRating} readOnly size={22} color="text-yellow-400" />
                <span className="ml-2 text-xl font-bold text-azul-primario">{averageRating.toFixed(1)}</span>
                <span className="ml-1 text-sm text-gray-400">({reviews.filter(r => r.isApproved).length} avaliações)</span>
            </div>
        </div>
        <Table<ReviewType>
          columns={columns}
          data={reviews}
          isLoading={loading && reviews.length === 0}
          emptyStateMessage="Nenhuma avaliação encontrada."
        />
      </Card>

      {isModalOpen && selectedReview && (
        <Modal isOpen={isModalOpen} onClose={closeReviewModal} title="Detalhes da Avaliação">
          <div className="space-y-3">
            <p><strong className="text-gray-400">Cliente:</strong> <span className="text-branco-nav">{selectedReview.clientName}</span></p>
            <p><strong className="text-gray-400">Serviço:</strong> <span className="text-branco-nav">{selectedReview.serviceName}</span></p>
            <p><strong className="text-gray-400">Barbeiro:</strong> <span className="text-branco-nav">{selectedReview.barberName}</span></p>
            <div className="flex items-center">
                <strong className="text-gray-400 mr-2">Nota:</strong> <StarRating rating={selectedReview.rating} readOnly color="text-yellow-400" />
            </div>
            <p><strong className="text-gray-400">Comentário:</strong></p>
            <p className="p-2 bg-gray-700 rounded text-gray-200 text-sm italic">"{selectedReview.comment}"</p>
            <p><strong className="text-gray-400">Data:</strong> <span className="text-branco-nav">{new Date(selectedReview.createdAt).toLocaleString('pt-BR')}</span></p>
            <p><strong className="text-gray-400">Status:</strong> {selectedReview.isApproved ? <span className="text-green-400">Aprovada</span> : <span className="text-yellow-400">Pendente</span>}</p>
          </div>
          <div className="mt-6 flex justify-end space-x-3">
            <Button variant="outline" onClick={closeReviewModal}>Fechar</Button>
            {!selectedReview.isApproved && (
              <Button variant="primary" className="bg-green-600 hover:bg-green-700" onClick={() => handleApproveReview(selectedReview.id, true)}>Aprovar</Button>
            )}
             {selectedReview.isApproved && (
              <Button variant="danger" onClick={() => handleApproveReview(selectedReview.id, false)}>Reprovar/Ocultar</Button>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ManageReviewsPage;
