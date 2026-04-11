import React from "react";
import { FiSearch } from "react-icons/fi";

const Search: React.FC = () => {
	return (
		<div className='flex items-center w-full max-w-xs border border-border rounded-full px-3 py-2 focus-within:ring-2 focus-within:ring-brand-500 bg-neutral-50'>
			<FiSearch className='text-neutral-500 mr-2' />
			<input
				type='text'
				placeholder='Search auctions...'
				className='w-full focus:outline-none bg-transparent text-foreground'
			/>
		</div>
	);
};

export default Search;
