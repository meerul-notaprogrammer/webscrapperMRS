import { X, Check, Pause, XCircle, ExternalLink, Calendar, Building2, DollarSign, Tag, Paperclip, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Tender, getDaysRemaining } from '../data/mockTenders';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Textarea } from './ui/textarea';

interface TenderDetailSidebarProps {
  tender: Tender | null;
  isOpen: boolean;
  onClose: () => void;
  onAccept: (tender: Tender) => void;
  onHold: (tender: Tender) => void;
  onRemove: (tender: Tender) => void;
}

export function TenderDetailSidebar({ tender, isOpen, onClose, onAccept, onHold, onRemove }: TenderDetailSidebarProps) {
  if (!tender) return null;

  const daysRemaining = getDaysRemaining(tender.dates.closing);
  const isUrgent = daysRemaining < 7;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full md:w-[480px] bg-card border-l border-sidebar-border shadow-[var(--shadow-depth-16)] z-50 overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-card border-b border-border p-4 flex items-center justify-between z-10">
              <h2 className="font-semibold text-card-foreground">Tender Details</h2>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Title Section */}
              <div>
                {isUrgent && (
                  <Badge variant="destructive" className="mb-2">
                    🔴 URGENT
                  </Badge>
                )}
                <h3 className="text-xl font-semibold text-card-foreground mb-2">
                  {tender.quotationNumber}
                </h3>
                <Badge variant="outline" className="mb-3">
                  {tender.category.code} - {tender.category.name}
                </Badge>
                <div className="flex items-center gap-2 text-2xl font-semibold text-primary">
                  <span>💰</span>
                  <span>RM {tender.amount.toLocaleString('en-MY', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              <Separator />

              {/* Description */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <h4 className="font-semibold text-card-foreground">📄 Tender Description</h4>
                </div>
                <div className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
                  {tender.description}
                </div>
              </div>

              <Separator />

              {/* Important Dates */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="h-4 w-4" />
                  <h4 className="font-semibold text-card-foreground">Important Dates</h4>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Published:</span>
                    <span className="font-medium text-card-foreground">
                      {tender.dates.published.toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Closing:</span>
                    <span className="font-medium text-card-foreground">
                      {tender.dates.closing.toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Time Left:</span>
                    <span className={`font-medium ${isUrgent ? 'text-destructive' : 'text-success'}`}>
                      {daysRemaining} days {isUrgent && '(⚠️ Urgent!)'}
                    </span>
                  </div>
                  {tender.dates.briefing && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Briefing:</span>
                      <span className="font-medium text-card-foreground">
                        {tender.dates.briefing.toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              {/* Ministry Information */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Building2 className="h-4 w-4" />
                  <h4 className="font-semibold text-card-foreground">Ministry Information</h4>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Name:</span>
                    <span className="font-medium text-card-foreground text-right max-w-[280px]">
                      {tender.ministry.name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Department:</span>
                    <span className="font-medium text-card-foreground text-right max-w-[280px]">
                      {tender.ministry.department}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Contact:</span>
                    <span className="font-medium text-card-foreground">
                      {tender.ministry.contact}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Phone:</span>
                    <span className="font-medium text-card-foreground">
                      {tender.ministry.phone}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Location:</span>
                    <span className="font-medium text-card-foreground">
                      {tender.ministry.location}
                    </span>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Financial Details */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <DollarSign className="h-4 w-4" />
                  <h4 className="font-semibold text-card-foreground">Financial Details</h4>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Estimated Value:</span>
                    <span className="font-medium text-card-foreground">
                      RM {tender.amount.toLocaleString('en-MY', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  {tender.budgetCode && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Budget Code:</span>
                      <span className="font-medium text-card-foreground">{tender.budgetCode}</span>
                    </div>
                  )}
                  {tender.paymentTerms && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Payment Terms:</span>
                      <span className="font-medium text-card-foreground">{tender.paymentTerms}</span>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              {/* Categories & Tags */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Tag className="h-4 w-4" />
                  <h4 className="font-semibold text-card-foreground">Categories & Tags</h4>
                </div>
                <div className="space-y-3">
                  <div>
                    <span className="text-xs text-muted-foreground">Category:</span>
                    <div className="mt-1">
                      <Badge variant="outline">
                        {tender.category.code} - {tender.category.name}
                      </Badge>
                    </div>
                  </div>
                  {tender.tags.length > 0 && (
                    <div>
                      <span className="text-xs text-muted-foreground">Tags:</span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {tender.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              {/* Attachments */}
              {tender.documents.length > 0 && (
                <>
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Paperclip className="h-4 w-4" />
                      <h4 className="font-semibold text-card-foreground">Attachments</h4>
                    </div>
                    <div className="space-y-2">
                      {tender.documents.map((doc, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 rounded-lg bg-muted hover:bg-muted/80 transition-colors cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            <div className="text-2xl">📄</div>
                            <div>
                              <div className="text-sm font-medium text-card-foreground">{doc.name}</div>
                              <div className="text-xs text-muted-foreground">{doc.size}</div>
                            </div>
                          </div>
                          <ExternalLink className="h-4 w-4 text-muted-foreground" />
                        </div>
                      ))}
                    </div>
                  </div>
                  <Separator />
                </>
              )}

              {/* Internal Notes */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <h4 className="font-semibold text-card-foreground">📝 Internal Notes (Team Only)</h4>
                </div>
                <Textarea
                  placeholder="Add notes about this tender..."
                  defaultValue={tender.notes}
                  className="min-h-[100px] resize-none"
                />
                {tender.activityHistory.length > 0 && tender.activityHistory.find(a => a.user) && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Last edited by {tender.activityHistory.find(a => a.user)?.user}, {' '}
                    {new Date(tender.activityHistory[tender.activityHistory.length - 1].timestamp).toLocaleString('en-MY', { 
                      hour: '2-digit', 
                      minute: '2-digit',
                      day: 'numeric',
                      month: 'short'
                    })}
                  </p>
                )}
              </div>

              <Separator />

              {/* Activity History */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="h-4 w-4" />
                  <h4 className="font-semibold text-card-foreground">Activity History</h4>
                </div>
                <div className="space-y-2">
                  {tender.activityHistory.map((activity, index) => (
                    <div key={index} className="flex items-start gap-2 text-sm">
                      <span className="text-muted-foreground">•</span>
                      <div>
                        <span className="text-card-foreground">{activity.action}</span>
                        <span className="text-muted-foreground ml-1">
                          - {new Date(activity.timestamp).toLocaleString('en-MY', { 
                            hour: '2-digit', 
                            minute: '2-digit',
                            day: 'numeric',
                            month: 'short'
                          })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <Button
                  className="bg-success hover:bg-success/90 text-success-foreground"
                  onClick={() => {
                    onAccept(tender);
                    onClose();
                  }}
                >
                  <Check className="h-4 w-4 mr-2" />
                  Accept Tender
                </Button>
                <Button
                  className="bg-warning hover:bg-warning/90 text-warning-foreground"
                  onClick={() => {
                    onHold(tender);
                    onClose();
                  }}
                >
                  <Pause className="h-4 w-4 mr-2" />
                  Put on Hold
                </Button>
                <Button
                  variant="outline"
                  className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                  onClick={() => {
                    onRemove(tender);
                    onClose();
                  }}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Remove
                </Button>
                <Button variant="outline">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Original
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
