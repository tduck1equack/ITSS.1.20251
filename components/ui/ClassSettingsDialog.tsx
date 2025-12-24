"use client";

import { useState, useEffect } from "react";
import axios from "@/lib/axios";
import {
  Dialog,
  Button,
  Flex,
  Text,
  TextField,
  TextArea,
  Checkbox,
} from "@radix-ui/themes";
import { FiSettings, FiLock, FiCopy, FiCheck } from "react-icons/fi";
import { useTranslations } from "next-intl";

interface Teacher {
  id: string;
  name: string;
  email?: string;
  avatar: string | null;
}

interface ClassData {
  id: string;
  code: string;
  name: string;
  description: string | null;
  semester: string | null;
  year: number | null;
  isPrivate?: boolean;
  joinCode?: string | null;
  teachers: Array<{
    teacher: Teacher;
  }>;
}

interface ClassSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classData?: ClassData | null;
  onUpdate: () => void;
}

export function ClassSettingsDialog({
  open,
  onOpenChange,
  classData,
  onUpdate,
}: ClassSettingsDialogProps) {
  const t = useTranslations('classes.settings_dialog');
  const [formData, setFormData] = useState({
    code: classData?.code || "",
    name: classData?.name || "",
    description: classData?.description || "",
    semester: classData?.semester || "",
    year: classData?.year || new Date().getFullYear(),
    isPrivate: classData?.isPrivate || false,
    joinCode: classData?.joinCode || "",
  });

  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedJoinCode, setCopiedJoinCode] = useState(false);

  const handleCopyCode = async () => {
    if (classData?.code) {
      await navigator.clipboard.writeText(classData.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCopyJoinCode = async () => {
    if (classData?.joinCode) {
      await navigator.clipboard.writeText(classData.joinCode);
      setCopiedJoinCode(true);
      setTimeout(() => setCopiedJoinCode(false), 2000);
    }
  };

  useEffect(() => {
    if (open && classData) {
      setFormData({
        code: classData.code,
        name: classData.name,
        description: classData.description || "",
        semester: classData.semester || "",
        year: classData.year || new Date().getFullYear(),
        isPrivate: classData.isPrivate || false,
        joinCode: classData.joinCode || "",
      });
    }
  }, [open, classData]);

  const handleUpdateInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!classData?.id) return;

    setLoading(true);
    try {
      await axios.patch(`/api/classes/${classData.id}`, formData);
      onUpdate();
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to update class:", error);
      alert(t('update_failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content style={{ maxWidth: 700, maxHeight: "85vh" }}>
        <Dialog.Title>{t('title')}</Dialog.Title>
        <Dialog.Description size="2" mb="4">
          {t('description')}
        </Dialog.Description>

        <form onSubmit={handleUpdateInfo}>
          <Flex direction="column" gap="3" className="mt-4">
            <label>
              <Text as="div" size="2" mb="1" weight="bold">
                {t('class_code')}
              </Text>
              <Flex gap="2">
                <TextField.Root
                  value={classData?.code || ""}
                  readOnly
                  className="flex-1 font-mono bg-gray-50"
                />
                <Button type="button" variant="soft" onClick={handleCopyCode}>
                  {copied ? <FiCheck size={16} /> : <FiCopy size={16} />}
                  {copied ? t('copied') : t('copy')}
                </Button>
              </Flex>
              <Text size="1" className="text-gray-500 mt-1 block">
                {t('class_code_hint')}
              </Text>
            </label>
            <label>
              <Text as="div" size="2" mb="1" weight="bold">
                {t('class_name')} <span className="text-red-500">*</span>
              </Text>
              <TextField.Root
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </label>
            <label>
              <Text as="div" size="2" mb="1" weight="bold">
                {t('description_label')}
              </Text>
              <TextArea
                value={formData.description}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    description: e.target.value,
                  })
                }
                rows={3}
              />
            </label>
            <Flex gap="3">
              <label className="flex-1">
                <Text as="div" size="2" mb="1" weight="bold">
                  {t('semester')}
                </Text>
                <TextField.Root
                  value={formData.semester}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      semester: e.target.value,
                    })
                  }
                />
              </label>
              <label className="flex-1">
                <Text as="div" size="2" mb="1" weight="bold">
                  {t('year')}
                </Text>
                <TextField.Root
                  type="number"
                  value={formData.year}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      year:
                        parseInt(e.target.value) || new Date().getFullYear(),
                    })
                  }
                />
              </label>
            </Flex>
            <label>
              <Flex align="center" gap="2">
                <Checkbox
                  checked={formData.isPrivate}
                  onCheckedChange={(checked) =>
                    setFormData({
                      ...formData,
                      isPrivate: checked === true,
                    })
                  }
                />
                <Flex align="center" gap="2">
                  <FiLock size={14} />
                  <Text size="2" weight="bold">
                    {t('private_class')}
                  </Text>
                </Flex>
              </Flex>
              <Text size="1" className="text-gray-500 ml-6 mt-1 block">
                {t('private_class_hint')}
              </Text>
            </label>
            {formData.isPrivate && classData?.joinCode && (
              <label>
                <Text as="div" size="2" mb="1" weight="bold">
                  {t('join_code')}
                </Text>
                <Flex gap="2">
                  <TextField.Root
                    value={classData.joinCode}
                    readOnly
                    className="flex-1 font-mono bg-gray-50"
                  />
                  <Button
                    type="button"
                    variant="soft"
                    onClick={handleCopyJoinCode}
                  >
                    {copiedJoinCode ? (
                      <FiCheck size={16} />
                    ) : (
                      <FiCopy size={16} />
                    )}
                    {copiedJoinCode ? t('copied') : t('copy')}
                  </Button>
                </Flex>
                <Text size="1" className="text-gray-500 mt-1 block">
                  {t('join_code_hint')}
                </Text>
              </label>
            )}
          </Flex>
          <Flex gap="3" mt="4" justify="end">
            <Dialog.Close>
              <Button variant="soft" color="gray" type="button">
                {t('cancel')}
              </Button>
            </Dialog.Close>
            <Button type="submit" className="bg-mint-500" disabled={loading}>
              {loading ? t('saving') : t('save_changes')}
            </Button>
          </Flex>
        </form>
      </Dialog.Content>
    </Dialog.Root>
  );
}
