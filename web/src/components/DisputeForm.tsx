'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface DisputeFormProps {
  escrowId: string;
  onSubmit: (data: {
    reason: string;
    desiredResolution: string;
    initialEvidence?: string;
  }) => Promise<void>;
  onCancel?: () => void;
}

export function DisputeForm({ escrowId, onSubmit, onCancel }: DisputeFormProps) {
  const [formData, setFormData] = useState({
    reason: '',
    desiredResolution: '',
    initialEvidence: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await onSubmit({
        reason: formData.reason,
        desiredResolution: formData.desiredResolution,
        initialEvidence: formData.initialEvidence || undefined,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create dispute');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">Raise Dispute</h2>
          <p className="text-gray-400">
            Submit a dispute for escrow: <span className="font-mono text-sm">{escrowId}</span>
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 text-red-500">
            {error}
          </div>
        )}

        <Input
          label="Dispute Reason *"
          placeholder="Why are you raising this dispute?"
          value={formData.reason}
          onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
          required
        />

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Desired Resolution *
          </label>
          <textarea
            className="w-full px-4 py-2.5 bg-gray-950 border border-gray-800 rounded-lg text-gray-50 placeholder-gray-500 transition-colors min-h-touch focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-transparent hover:border-gray-700"
            rows={3}
            placeholder="What outcome are you seeking?"
            value={formData.desiredResolution}
            onChange={(e) =>
              setFormData({ ...formData, desiredResolution: e.target.value })
            }
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Initial Evidence (Optional)
          </label>
          <textarea
            className="w-full px-4 py-2.5 bg-gray-950 border border-gray-800 rounded-lg text-gray-50 placeholder-gray-500 transition-colors min-h-touch focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-transparent hover:border-gray-700"
            rows={4}
            placeholder="Provide any relevant evidence or context..."
            value={formData.initialEvidence}
            onChange={(e) =>
              setFormData({ ...formData, initialEvidence: e.target.value })
            }
          />
        </div>

        <div className="bg-orange-600/10 border border-orange-600/30 rounded-lg p-4">
          <h3 className="font-bold text-orange-600 mb-2">⚠️ Important</h3>
          <ul className="text-sm text-gray-300 space-y-1">
            <li>• Raising a dispute will freeze the escrow</li>
            <li>• Both parties can submit evidence</li>
            <li>• An arbitrator will review and make a final decision</li>
            <li>• False disputes may affect your trust score</li>
          </ul>
        </div>

        <div className="flex gap-3">
          {onCancel && (
            <Button
              type="button"
              variant="secondary"
              size="lg"
              className="flex-1"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            size="lg"
            className="flex-1"
            disabled={
              !formData.reason ||
              !formData.desiredResolution ||
              isSubmitting
            }
          >
            {isSubmitting ? 'Submitting...' : 'Submit Dispute'}
          </Button>
        </div>
      </form>
    </Card>
  );
}
