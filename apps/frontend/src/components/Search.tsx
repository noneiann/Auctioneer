import React from "react";
import { FiSearch } from "react-icons/fi";

const Search: React.FC = () => {
	return (
		<div className='flex items-center w-full max-w-xs border border-gray-300 rounded-full px-3 py-2 focus-within:ring-2 focus-within:ring-blue-500 bg-white dark:bg-gray-800'>
			<FiSearch className='text-gray-500 mr-2' />
			<input
				type='text'
				placeholder='Search auctions...'
				className='w-full focus:outline-none bg-transparent text-gray-900 dark:text-gray-100'
			/>
		</div>
	);
};

export default Search;
