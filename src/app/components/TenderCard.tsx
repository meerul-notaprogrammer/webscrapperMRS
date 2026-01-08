import { Calendar, Building2, MapPin, FileText, Eye, Check, Pause, X } from 'lucide-react';
import { motion } from 'motion/react';
import { Tender, getDaysRemaining } from '../data/mockTenders';
import { Badge } from './ui/badge';
import { Button } from './ui/button';

interface TenderCardProps {
  tender: Tender;
  onView: (tender: Tender) => void;
  onAccept: (tender: Tender) => void;
  onHold: (tender: Tender) => void;
  onRemove: (tender: Tender) => void;
}

export function TenderCard({ tender, onView, onAccept, onHold, onRemove }: TenderCardProps) {
  const daysRemaining = getDaysRemaining(tender.dates.closing);
  const isUrgent = daysRemaining < 7;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2, scale: 1.005 }}
      transition={{ duration: 0.2 }}
      className={`bg-card rounded-lg p-5 border transition-all duration-200 hover:shadow-[var(--shadow-depth-8)] shadow-[var(--shadow-depth-4)] ${
        isUrgent ? 'border-l-4 border-l-destructive' : 'border-border'
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3 flex-1">
          {isUrgent && (
            <Badge variant="destructive" className="text-xs font-medium">
              URGENT
            </Badge>
          )}
          <span className="text-sm font-semibold text-card-foreground">
            {tender.quotationNumber}
          </span>
          <Badge variant="outline" className="text-xs">
            {tender.category.code}
          </Badge>
        </div>
        <div className="flex items-center gap-2 text-primary font-semibold">
          <span className="text-lg">💰</span>
          <span>RM {tender.amount.toLocaleString('en-MY', { minimumFractionDigits: 2 })}</span>
        </div>
      </div>

      {/* Summary */}
      <p className="text-sm text-card-foreground leading-relaxed mb-4 line-clamp-2">
        {tender.summary}
      </p>

      {/* Metadata */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground mb-4">
        <div className="flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5" />
          <span>Closes: {tender.dates.closing.toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
          <span className={`font-medium ${isUrgent ? 'text-destructive' : 'text-success'}`}>
            ({daysRemaining} {daysRemaining === 1 ? 'day' : 'days'})
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <Building2 className="h-3.5 w-3.5" />
          <span className="truncate max-w-[200px]">{tender.ministry.name}</span>
        </div>
        {tender.ministry.location && (
          <div className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5" />
            <span>{tender.ministry.location}</span>
          </div>
        )}
        {tender.documents.length > 0 && (
          <div className="flex items-center gap-1.5">
            <FileText className="h-3.5 w-3.5" />
            <span>{tender.documents.length} document{tender.documents.length !== 1 ? 's' : ''}</span>
          </div>
        )}
      </div>

      {/* Tags */}
      {tender.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {tender.tags.slice(0, 5).map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center px-2 py-1 rounded-md bg-muted text-xs text-muted-foreground"
            >
              🏷️ {tag}
            </span>
          ))}
          {tender.tags.length > 5 && (
            <span className="inline-flex items-center px-2 py-1 rounded-md bg-muted text-xs text-muted-foreground">
              +{tender.tags.length - 5} more
            </span>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            className="bg-success hover:bg-success/90 text-success-foreground"
            onClick={() => onAccept(tender)}
          >
            <Check className="h-4 w-4 mr-1" />
            Accept
          </Button>
          <Button
            size="sm"
            className="bg-warning hover:bg-warning/90 text-warning-foreground"
            onClick={() => onHold(tender)}
          >
            <Pause className="h-4 w-4 mr-1" />
            Hold
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
            onClick={() => onRemove(tender)}
          >
            <X className="h-4 w-4 mr-1" />
            Remove
          </Button>
        </div>
        <Button
          size="sm"
          variant="outline"
          className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
          onClick={() => onView(tender)}
        >
          <Eye className="h-4 w-4 mr-1" />
          View
        </Button>
      </div>
    </motion.div>
  );
}
