import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { SquareChartGantt, Pencil, Trash2, Menu, Printer, Barcode } from "lucide-react"

type ActionMenuProps<T> = {
  item: T;
  onView?: (item: T) => void;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  onPrint?: (item: T) => void;
  onBarcode?: (item: T) => void;
  onAuditLog?: (item: T) => void;
  onCollect?: (item: T) => void;
  onAck?: (item: T) => void;
  onValidate?: (item: T) => void;
  onReject?: (item: T) => void;
};

export function ActionMenu<T>({
  item,
  
  onView,
  onEdit,
  onPrint,
  onBarcode,
  onDelete,
  onAuditLog,
  onCollect,
  onAck,
  onValidate,
  onReject,
}: ActionMenuProps<T>) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger >
        <Button variant="ghost" size="icon" className="h-8 w-8 ">
          <Menu className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        {onView && (
          <DropdownMenuItem onClick={() => onView(item)}>
            <SquareChartGantt className="mr-2 h-4 w-4" />
            View
          </DropdownMenuItem>
        )}
        {onEdit && (
          <DropdownMenuItem onClick={() => onEdit(item)}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>
        )}
        {onPrint && (
          <DropdownMenuItem onClick={() => onPrint(item)}>
            <Printer className="mr-2 h-4 w-4 text-blue-600" />
            Print
          </DropdownMenuItem>
        )}
        {onBarcode && (
          <DropdownMenuItem onClick={() => onBarcode(item)}>
            <Barcode className="mr-2 h-4 w-4 text-purple-600" />
            Generate Barcode
          </DropdownMenuItem>
        )}
        {onAuditLog && (
          <DropdownMenuItem onClick={() => onAuditLog(item)}>
            <span className="mr-2">📋</span>
            Audit Log
          </DropdownMenuItem>
        )}
        {onCollect && (
          <DropdownMenuItem onClick={() => onCollect(item)}>
            <span className="mr-2">📥</span>
            Collect
          </DropdownMenuItem>
        )}
        {onAck && (
          <DropdownMenuItem onClick={() => onAck(item)}>
            <span className="mr-2">✅</span>
            Acknowledge
          </DropdownMenuItem>
        )}
        {onValidate && (
          <DropdownMenuItem onClick={() => onValidate(item)}>
            <span className="mr-2">✓</span>
            Validate
          </DropdownMenuItem>
        )}
        {onReject && (
          <DropdownMenuItem onClick={() => onReject(item)}>
            <span className="mr-2">✕</span>
            Reject
          </DropdownMenuItem>
        )}
        {onDelete && (
          <DropdownMenuItem 
            onClick={() => onDelete(item)} 
            className="text-red-600 focus:text-red-600"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}