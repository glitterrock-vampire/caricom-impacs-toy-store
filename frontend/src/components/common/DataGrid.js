// src/components/common/DataGrid.js
import React from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  CircularProgress,
  Typography,
  Box,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';

const DataGrid = ({
  columns,
  data,
  loading,
  page,
  rowsPerPage,
  totalCount,
  onPageChange,
  onRowsPerPageChange,
  onView,
  onEdit,
  onDelete,
  noDataMessage = 'No records found',
  showActions = true
}) => {
  const handleChangePage = (event, newPage) => {
    onPageChange(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    onRowsPerPageChange(parseInt(event.target.value, 10));
  };

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      <TableContainer sx={{ maxHeight: 600 }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell 
                  key={column.field} 
                  style={{ 
                    minWidth: column.minWidth,
                    fontWeight: 'bold',
                    backgroundColor: (theme) => theme.palette.primary.main,
                    color: (theme) => theme.palette.primary.contrastText
                  }}
                >
                  {column.headerName}
                </TableCell>
              ))}
              {showActions && (onView || onEdit || onDelete) && (
                <TableCell 
                  style={{ 
                    minWidth: 120,
                    fontWeight: 'bold',
                    backgroundColor: (theme) => theme.palette.primary.main,
                    color: (theme) => theme.palette.primary.contrastText
                  }}
                >
                  Actions
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell 
                  colSpan={columns.length + (showActions ? 1 : 0)} 
                  align="center"
                  sx={{ height: 300 }}
                >
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell 
                  colSpan={columns.length + (showActions ? 1 : 0)} 
                  align="center"
                  sx={{ height: 100 }}
                >
                  <Typography variant="body1" color="textSecondary">
                    {noDataMessage}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              data.map((row) => (
                <TableRow 
                  hover 
                  key={row.id}
                  sx={{ '&:hover': { cursor: 'pointer' } }}
                >
                  {columns.map((column) => (
                    <TableCell 
                      key={`${row.id}-${column.field}`}
                      onClick={() => onView && onView(row)}
                    >
                      {column.renderCell ? column.renderCell(row) : row[column.field]}
                    </TableCell>
                  ))}
                  {showActions && (onView || onEdit || onDelete) && (
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        {onView && (
                          <Tooltip title="View">
                            <IconButton 
                              size="small" 
                              color="primary"
                              onClick={(e) => {
                                e.stopPropagation();
                                onView(row);
                              }}
                            >
                              <ViewIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        {onEdit && (
                          <Tooltip title="Edit">
                            <IconButton 
                              size="small" 
                              color="secondary"
                              onClick={(e) => {
                                e.stopPropagation();
                                onEdit(row);
                              }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        {onDelete && (
                          <Tooltip title="Delete">
                            <IconButton 
                              size="small" 
                              color="error"
                              onClick={(e) => {
                                e.stopPropagation();
                                onDelete(row);
                              }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 50]}
        component="div"
        count={totalCount}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  );
};

export default DataGrid;