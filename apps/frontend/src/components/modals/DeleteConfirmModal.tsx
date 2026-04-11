"use client";
import { AlertTriangle, X } from "lucide-react";

interface DeleteConfirmModalProps {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: () => void;
	itemName: string;
	loading?: boolean;
}

export default function DeleteConfirmModal({
	isOpen,
	onClose,
	onConfirm,
	itemName,
	loading = false,
}: DeleteConfirmModalProps) {
	if (!isOpen) return null;

	return (
		<div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
			<div className='bg-surface-raised rounded-lg p-6 w-full max-w-md'>
				<div className='flex justify-between items-start mb-4'>
					<div className='flex items-center gap-3'>
						<div className='bg-danger/10 p-2 rounded-full'>
							<AlertTriangle className='w-6 h-6 text-danger' />
						</div>
						<h2 className='text-xl font-bold text-foreground'>
							Delete Auction
						</h2>
					</div>
					<button
						onClick={onClose}
						className='text-neutral-500 hover:text-foreground'>
						<X className='w-5 h-5' />
					</button>
				</div>

				<p className='text-neutral-600 mb-6'>
					Are you sure you want to delete the auction for{" "}
					<span className='font-semibold text-foreground'>
						{itemName}
					</span>
					? This action cannot be undone.
				</p>

				<div className='flex justify-end gap-3'>
					<button
						type='button'
						onClick={onClose}
						disabled={loading}
						className='px-4 py-2 text-sm font-medium text-neutral-600 bg-neutral-200 rounded-md hover:bg-neutral-300 disabled:opacity-50 disabled:cursor-not-allowed'>
						Cancel
					</button>
					<button
						type='button'
						onClick={onConfirm}
						disabled={loading}
						className='px-4 py-2 text-sm font-medium text-white bg-danger rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed'>
						{loading ? "Deleting..." : "Delete"}
					</button>
				</div>
			</div>
		</div>
	);
}
