"use client";

import React, { useState } from "react";
import {
    Dialog,
    Flex,
    Text,
    Button,
    TextArea,
    Card,
} from "@radix-ui/themes";
import { FiSend, FiSave, FiX, FiFile, FiUpload } from "react-icons/fi";
import { FilePickerInput, FileAttachment } from "./FilePickerInput";

interface SubmitAssignmentDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: {
        content: string;
        attachments: FileAttachment[];
        status: "DRAFT" | "SUBMITTED";
    }) => Promise<void>;
    initialContent?: string;
    initialAttachments?: FileAttachment[];
    assignmentTitle: string;
    isDraft?: boolean;
}

export function SubmitAssignmentDialog({
    open,
    onOpenChange,
    onSubmit,
    initialContent = "",
    initialAttachments = [],
    assignmentTitle,
    isDraft = true,
}: SubmitAssignmentDialogProps) {
    const [content, setContent] = useState(initialContent);
    const [attachments, setAttachments] = useState<FileAttachment[]>(
        initialAttachments
    );
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (status: "DRAFT" | "SUBMITTED") => {
        try {
            setIsSubmitting(true);
            await onSubmit({ content, attachments, status });
            onOpenChange(false);
        } catch (error) {
            console.error("Error submitting assignment:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleFileChange = (files: FileAttachment[]) => {
        setAttachments(files);
    };

    const removeAttachment = (index: number) => {
        setAttachments(attachments.filter((_, i) => i !== index));
    };

    return (
        <Dialog.Root open={open} onOpenChange={onOpenChange}>
            <Dialog.Content style={{ maxWidth: 600 }}>
                <Dialog.Title>
                    {isDraft ? "Nộp bài tập" : "Cập nhật bài nộp"}
                </Dialog.Title>
                <Dialog.Description size="2" mb="4">
                    {assignmentTitle}
                </Dialog.Description>

                <Flex direction="column" gap="4">
                    {/* Content Text Area */}
                    <div>
                        <Text as="label" size="2" weight="bold" mb="2">
                            Nội dung bài làm
                        </Text>
                        <TextArea
                            placeholder="Nhập nội dung bài làm của bạn..."
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            rows={8}
                            className="w-full mt-2"
                        />
                    </div>

                    {/* File Attachments */}
                    <div>
                        <Text as="label" size="2" weight="bold" mb="2">
                            Tệp đính kèm
                        </Text>
                        <FilePickerInput
                            value={attachments}
                            onChange={handleFileChange}
                            maxFiles={10}
                        />

                        {/* Display uploaded files */}
                        {attachments.length > 0 && (
                            <Card className="mt-3 p-3">
                                <Flex direction="column" gap="2">
                                    {attachments.map((file, index) => (
                                        <Flex
                                            key={index}
                                            justify="between"
                                            align="center"
                                            className="p-2 bg-gray-50 rounded"
                                        >
                                            <Flex gap="2" align="center">
                                                <FiFile className="text-mint-600" />
                                                <div>
                                                    <Text size="2" weight="medium">
                                                        {file.fileName}
                                                    </Text>
                                                    {file.fileSize && (
                                                        <Text size="1" className="text-gray-500">
                                                            {(file.fileSize / 1024 / 1024).toFixed(2)} MB
                                                        </Text>
                                                    )}
                                                </div>
                                            </Flex>
                                            <Button
                                                size="1"
                                                variant="ghost"
                                                color="red"
                                                onClick={() => removeAttachment(index)}
                                            >
                                                <FiX size={16} />
                                            </Button>
                                        </Flex>
                                    ))}
                                </Flex>
                            </Card>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <Flex gap="3" mt="4" justify="end">
                        <Dialog.Close>
                            <Button variant="soft" color="gray" disabled={isSubmitting}>
                                Hủy
                            </Button>
                        </Dialog.Close>
                        <Button
                            variant="soft"
                            onClick={() => handleSubmit("DRAFT")}
                            disabled={isSubmitting}
                        >
                            <FiSave size={16} />
                            Lưu nháp
                        </Button>
                        <Button
                            className="bg-mint-500 hover:bg-mint-600"
                            onClick={() => handleSubmit("SUBMITTED")}
                            disabled={isSubmitting}
                        >
                            <FiSend size={16} />
                            Nộp bài
                        </Button>
                    </Flex>
                </Flex>
            </Dialog.Content>
        </Dialog.Root>
    );
}
