import { ActionIcon, Menu, rem } from '@mantine/core';
import { IconDots, IconEye, IconEdit, IconTrash } from '@tabler/icons-react';
import type { ReactNode } from 'react';

interface ActionMenuProps {
    onView?: () => void;
    onEdit?: () => void;
    onDelete?: () => void;
    customItems?: ReactNode;
}

export function ActionMenu({ onView, onEdit, onDelete, customItems }: ActionMenuProps) {
    return (
        <Menu transitionProps={{ transition: 'pop' }} withArrow position="bottom-end" withinPortal>
            <Menu.Target>
                <ActionIcon variant="subtle" color="gray">
                    <IconDots style={{ width: rem(16), height: rem(16) }} stroke={1.5} />
                </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
                {onView && (
                    <Menu.Item
                        leftSection={<IconEye style={{ width: rem(16), height: rem(16) }} />}
                        onClick={onView}
                    >
                        View Details
                    </Menu.Item>
                )}
                {onEdit && (
                    <Menu.Item
                        leftSection={<IconEdit style={{ width: rem(16), height: rem(16) }} />}
                        onClick={onEdit}
                    >
                        Edit
                    </Menu.Item>
                )}
                {customItems}
                {onDelete && (
                    <>
                        <Menu.Divider />
                        <Menu.Item
                            leftSection={<IconTrash style={{ width: rem(16), height: rem(16) }} />}
                            color="red"
                            onClick={onDelete}
                        >
                            Delete
                        </Menu.Item>
                    </>
                )}
            </Menu.Dropdown>
        </Menu>
    );
}
