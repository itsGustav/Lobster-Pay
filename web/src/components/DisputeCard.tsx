import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Dispute, DisputeStatus } from '@/types/dispute';

interface DisputeCardProps {
  dispute: Dispute;
}

function getStatusBadgeVariant(status: DisputeStatus): 'warning' | 'default' | 'success' {
  switch (status) {
    case 'open':
      return 'warning';
    case 'evidence':
      return 'default';
    case 'resolved':
      return 'success';
    default:
      return 'default';
  }
}

function getStatusLabel(status: DisputeStatus): string {
  switch (status) {
    case 'open':
      return 'Open';
    case 'evidence':
      return 'Evidence Phase';
    case 'resolved':
      return 'Resolved';
    default:
      return status;
  }
}

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function DisputeCard({ dispute }: DisputeCardProps) {
  return (
    <Card hover>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-bold">
                Escrow: {dispute.escrowDescription || formatAddress(dispute.escrowId)}
              </h3>
              <Badge variant={getStatusBadgeVariant(dispute.status)}>
                {getStatusLabel(dispute.status)}
              </Badge>
            </div>
            <p className="text-sm text-gray-400">
              Created {formatDate(dispute.createdAt)}
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-orange-600">
              {dispute.escrowAmount} USDC
            </div>
          </div>
        </div>

        {/* Reason */}
        <div>
          <div className="text-sm text-gray-400 mb-1">Dispute Reason</div>
          <p className="text-gray-200">{dispute.reason}</p>
        </div>

        {/* Parties */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-gray-400 mb-1">Raised By</div>
            <div className="font-mono text-xs">{formatAddress(dispute.createdBy)}</div>
          </div>
          <div>
            <div className="text-gray-400 mb-1">Evidence Count</div>
            <div>{dispute.evidence.length} submission{dispute.evidence.length !== 1 ? 's' : ''}</div>
          </div>
        </div>

        {/* Resolution (if resolved) */}
        {dispute.resolution && (
          <div className="pt-4 border-t border-gray-800">
            <div className="text-sm text-gray-400 mb-1">Resolution</div>
            <div className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              <span>
                {dispute.resolution.outcome === 'favor-creator'
                  ? 'In favor of dispute creator'
                  : dispute.resolution.outcome === 'favor-recipient'
                  ? 'In favor of recipient'
                  : 'Split resolution'}
              </span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Link href={`/dashboard/disputes/${dispute.id}`} className="flex-1">
            <Button variant="outline" className="w-full">
              View Details →
            </Button>
          </Link>
          {dispute.status !== 'resolved' && (
            <Link href={`/dashboard/disputes/${dispute.id}#evidence`}>
              <Button variant="secondary">
                Add Evidence
              </Button>
            </Link>
          )}
        </div>
      </div>
    </Card>
  );
}
