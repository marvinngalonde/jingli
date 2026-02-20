export type NoticeAudience = 'ALL' | 'STUDENTS' | 'STAFF' | 'PARENTS';

export interface Notice {
    id: string;
    schoolId: string;
    title: string;
    content: string;
    postedBy: string;
    targetAudience: NoticeAudience;
    postedAt: string;
    expiresAt?: string | null;
    poster?: {
        email: string;
        staffProfile?: {
            firstName: string;
            lastName: string;
        } | null;
    };
}

export interface CreateNoticeDto {
    title: string;
    content: string;
    targetAudience: NoticeAudience;
    expiresAt?: string;
}

export interface UpdateNoticeDto extends Partial<CreateNoticeDto> { }
