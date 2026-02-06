"use client";

import { useEffect, useMemo, useState, useTransition, type FormEvent } from "react";
import { format } from "date-fns";
import { Pencil, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

import { useConfirmDialog } from "@/components/confirm-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { adminUserDetailPath, attachmentDownloadPath } from "@/paths";
import { UserFormFields } from "./user-form-fields";
import { createUser, deleteUser, updateUser } from "../actions/users";
import { getUsers } from "../queries/get-users";

type UserRecord = Awaited<ReturnType<typeof getUsers>>[number];

type UserFormValues = {
  username: string;
  email: string;
  password: string;
  emailVerified: string;
  isAdmin: string;
  isSuperAdmin: string;
  attachmentId: string;
};

const defaultFormValues: UserFormValues = {
  username: "",
  email: "",
  password: "",
  emailVerified: "false",
  isAdmin: "false",
  isSuperAdmin: "false",
  attachmentId: "",
};

const DeleteUserButton = ({
  userId,
  disabled,
  onDeleted,
}: {
  userId: string;
  disabled: boolean;
  onDeleted: () => void;
}) => {
  const [trigger, dialog] = useConfirmDialog({
    title: "Delete user",
    description:
      "Are you sure you want to delete this record permanently from the database?",
    action: async () => {
      const result = await deleteUser(userId);
      if (result.status === "SUCCESS") {
        onDeleted();
      }
      return result;
    },
    trigger: (isLoading) => (
      <Button variant="ghost" size="icon" disabled={disabled || isLoading}>
        <Trash2 className="h-4 w-4 text-red-500" />
      </Button>
    ),
  });

  return (
    <>
      {trigger}
      {dialog}
    </>
  );
};

export function UsersTable({
  initialUsers,
  canEdit,
  canDelete,
  canAssignRoles,
}: {
  initialUsers: UserRecord[];
  canEdit: boolean;
  canDelete: boolean;
  canAssignRoles: boolean;
}) {
  const [users, setUsers] = useState<UserRecord[]>(initialUsers);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<UserRecord | null>(null);
  const [formValues, setFormValues] = useState<UserFormValues>(defaultFormValues);
  const [isPending, startTransition] = useTransition();

  const tableRows = useMemo(() => users.slice(0, 6), [users]);

  const loadUsers = () => {
    startTransition(async () => {
      const data = await getUsers();
      setUsers(data);
    });
  };

  useEffect(() => {
    if (!formOpen) return;
    if (editing) {
      setFormValues({
        username: editing.username,
        email: editing.email,
        password: "",
        emailVerified: String(editing.emailVerified),
        isAdmin: String(editing.isAdmin),
        isSuperAdmin: String(editing.isSuperAdmin),
        attachmentId: editing.attachmentId ?? "",
      });
    } else {
      setFormValues(defaultFormValues);
    }
  }, [editing, formOpen]);

  const handleAddClick = () => {
    if (!canEdit) return;
    setEditing(null);
    setFormOpen(true);
  };

  const handleEditClick = (user: UserRecord) => {
    if (!canEdit) return;
    setEditing(user);
    setFormOpen(true);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    startTransition(async () => {
      const payload = {
        username: formValues.username,
        email: formValues.email,
        password: formValues.password || undefined,
        emailVerified: formValues.emailVerified === "true",
        isAdmin: formValues.isAdmin === "true",
        isSuperAdmin: formValues.isSuperAdmin === "true",
        attachmentId: formValues.attachmentId || null,
      };

      const action = editing
        ? await updateUser(editing.id, payload)
        : await createUser(payload);
      if (action.status === "ERROR") {
        toast.error(action.message || "Please check the form fields.");
        return;
      }

      toast.success(action.message || "Saved.");
      setFormOpen(false);
      setEditing(null);
      loadUsers();
    });
  };

  return (
    <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
            Users
          </p>
          <h1 className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
            Account management
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Manage staff access, roles, and verification status.
          </p>
        </div>
        {canEdit ? (
          <Button
            className="rounded-full bg-blue-600 text-white hover:bg-blue-700"
            onClick={handleAddClick}
          >
            Add User
          </Button>
        ) : null}
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-950">
        <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
          <span>Show</span>
          <Select defaultValue="10">
            <SelectTrigger className="h-9 w-[90px] rounded-full border-slate-200 bg-white text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
          <span>entries</span>
        </div>
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search..."
            className="h-10 rounded-full border-slate-200 bg-white pl-9 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
          />
        </div>
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200/70 dark:border-slate-800">
        <Table>
          <TableHeader className="bg-white text-xs font-semibold uppercase tracking-[0.12em] text-slate-400 dark:bg-slate-900 dark:text-slate-500">
            <TableRow className="border-slate-200/70 dark:border-slate-800">
              <TableHead>Photo</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Verified</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tableRows.length ? (
              tableRows.map((user) => (
                <TableRow
                  key={user.id}
                  className="border-slate-100 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-950"
                >
                  <TableCell>
                        <div className="h-10 w-14 overflow-hidden rounded-lg bg-slate-100">
                          <img
                            src={
                              user.attachmentId
                                ? attachmentDownloadPath(user.attachmentId)
                                : "/assets/profile-placeholder.svg"
                            }
                            alt={user.username}
                            className="h-full w-full object-cover"
                            loading="lazy"
                            decoding="async"
                          />
                        </div>
                  </TableCell>
                  <TableCell className="font-semibold text-slate-900 dark:text-white">
                    <Link
                      href={adminUserDetailPath(user.id)}
                      className="transition hover:text-blue-600"
                    >
                      {user.username}
                    </Link>
                  </TableCell>
                  <TableCell className="text-slate-500 dark:text-slate-400">
                    {user.email}
                  </TableCell>
                  <TableCell className="text-slate-500 dark:text-slate-400">
                    {user.emailVerified ? "Yes" : "No"}
                  </TableCell>
                  <TableCell className="text-slate-500 dark:text-slate-400">
                    {user.isSuperAdmin
                      ? "Super Admin"
                      : user.isAdmin
                        ? "Admin"
                        : "User"}
                  </TableCell>
                  <TableCell className="text-slate-500 dark:text-slate-400">
                    {format(new Date(user.createdAt), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {canEdit ? (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditClick(user)}
                        >
                          <Pencil className="h-4 w-4 text-slate-500" />
                        </Button>
                      ) : null}
                      {canDelete ? (
                        <DeleteUserButton
                          userId={user.id}
                          disabled={isPending}
                          onDeleted={loadUsers}
                        />
                      ) : null}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="py-10 text-center text-sm text-slate-500">
                  No users found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-xl rounded-3xl border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-slate-900 dark:text-white">
              {editing ? "Edit user" : "Add user"}
            </DialogTitle>
          </DialogHeader>
          <form className="mt-4 grid gap-4" onSubmit={handleSubmit}>
            <UserFormFields
              values={formValues}
              canAssignRoles={canAssignRoles}
              isEditing={Boolean(editing)}
              onChange={setFormValues}
            />
            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                className="rounded-full bg-blue-600 text-white hover:bg-blue-700"
                disabled={isPending}
              >
                {editing ? "Save changes" : "Create user"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
