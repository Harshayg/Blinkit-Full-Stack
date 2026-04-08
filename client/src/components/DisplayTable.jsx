import React from 'react';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { motion } from 'framer-motion';

const DisplayTable = ({ data, column }) => {
  const table = useReactTable({
    data,
    columns: column,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="p-6 bg-white min-h-screen">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="overflow-x-auto rounded-xl border border-gray-300 shadow-xl"
      >
        <motion.table
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full border-collapse text-sm text-left text-gray-800"
        >
          <thead className="bg-gray-100 border-b border-gray-300">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="">
                <th className="px-6 py-3 border-r border-gray-300 font-semibold tracking-wide">Sr.No</th>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-6 py-3 border-r border-gray-300 font-semibold tracking-wide whitespace-nowrap"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row, index) => (
              <motion.tr
                key={row.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="border-b border-gray-200 hover:bg-gray-50 transition-all"
              >
                <td className="px-6 py-4 border-r border-gray-200 font-medium">
                  {index + 1}
                </td>
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className="px-6 py-4 border-r border-gray-200 whitespace-nowrap"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </motion.tr>
            ))}
          </tbody>
        </motion.table>
      </motion.div>
    </div>
  );
};

export default DisplayTable;