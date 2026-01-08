/**
 * Scrape Progress Dialog
 * Shows real-time progress when scraping is in progress
 */

import { useEffect, useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from './ui/dialog';
import { Progress } from './ui/progress';
import { Button } from './ui/button';
import { Loader2, CheckCircle2, XCircle, FileText } from 'lucide-react';

interface ScrapeProgressDialogProps {
    isOpen: boolean;
    onClose: () => void;
    status?: {
        success: boolean;
        is_running: boolean;
        last_scrape?: {
            tenders_found: number;
            new_tenders: number;
            updated_tenders: number;
            duration_seconds: number;
            status: string;
        } | null;
    };
}

export function ScrapeProgressDialog({ isOpen, onClose, status }: ScrapeProgressDialogProps) {
    const [progress, setProgress] = useState(0);
    const [statusText, setStatusText] = useState('Initializing scraper...');

    const isRunning = status?.is_running ?? false;
    const lastScrape = status?.last_scrape;

    useEffect(() => {
        if (isRunning) {
            // Simulate progress while scraping
            const interval = setInterval(() => {
                setProgress(prev => {
                    if (prev >= 90) return prev;
                    return prev + Math.random() * 10;
                });
            }, 1000);

            // Update status text
            const messages = [
                'Connecting to ePerolehan...',
                'Loading tender list...',
                'Scraping page 1...',
                'Extracting tender details...',
                'Processing documents...',
                'Saving to database...',
            ];

            let messageIndex = 0;
            const textInterval = setInterval(() => {
                setStatusText(messages[messageIndex % messages.length]);
                messageIndex++;
            }, 2000);

            return () => {
                clearInterval(interval);
                clearInterval(textInterval);
            };
        } else if (lastScrape) {
            // Scrape completed
            setProgress(100);
            if (lastScrape.status === 'success') {
                setStatusText(`Completed! Found ${lastScrape.tenders_found} tenders.`);
            } else if (lastScrape.status === 'partial') {
                setStatusText(`Partially completed. Some errors occurred.`);
            } else {
                setStatusText('Scraping failed. Please try again.');
            }
        }
    }, [isRunning, lastScrape]);

    // Reset progress when dialog opens
    useEffect(() => {
        if (isOpen) {
            setProgress(0);
            setStatusText('Initializing scraper...');
        }
    }, [isOpen]);

    const getIcon = () => {
        if (isRunning) {
            return <Loader2 className="h-12 w-12 text-primary animate-spin" />;
        }
        if (lastScrape?.status === 'success') {
            return <CheckCircle2 className="h-12 w-12 text-green-500" />;
        }
        if (lastScrape?.status === 'failed') {
            return <XCircle className="h-12 w-12 text-red-500" />;
        }
        return <FileText className="h-12 w-12 text-primary" />;
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && !isRunning && onClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-3">
                        {getIcon()}
                        <span>
                            {isRunning ? 'Scraping in Progress' : 'Scrape Complete'}
                        </span>
                    </DialogTitle>
                    <DialogDescription>
                        {isRunning
                            ? 'Please wait while we fetch the latest tenders from ePerolehan...'
                            : 'The scraping process has finished.'}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Progress Bar */}
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">{statusText}</span>
                            <span className="font-medium">{Math.round(progress)}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                    </div>

                    {/* Results Summary (when complete) */}
                    {!isRunning && lastScrape && (
                        <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Tenders Found:</span>
                                <span className="font-semibold">{lastScrape.tenders_found}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">New Tenders:</span>
                                <span className="font-semibold text-green-600">{lastScrape.new_tenders}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Updated:</span>
                                <span className="font-semibold text-blue-600">{lastScrape.updated_tenders}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Duration:</span>
                                <span className="font-semibold">{lastScrape.duration_seconds}s</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-2">
                    {isRunning ? (
                        <Button variant="outline" disabled>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Scraping...
                        </Button>
                    ) : (
                        <Button onClick={onClose}>
                            Close
                        </Button>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
