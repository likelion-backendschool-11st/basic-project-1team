import React from 'react';
import { Link } from 'react-router-dom';
import { Icon } from './Icon';

const copy = {
  code: '404',
  title: '페이지를 찾을 수 없습니다',
  description: '주소가 잘못되었거나 더 이상 제공하지 않는 페이지입니다.',
  home: '처음 화면으로',
};

interface NotFoundPageProps {
  /** 처음 화면 경로 (라우터 기준) */
  readonly homePath: string;
}

/** 없는 주소로 들어왔을 때 보여 주는 화면. 사용자·관리자 사이트 공통 */
export const NotFoundPage: React.FC<NotFoundPageProps> = ({ homePath }) => (
  <div className="mx-auto flex max-w-[480px] flex-col items-center gap-space-md px-margin py-24 text-center">
    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-container/20 text-primary">
      <Icon name="explore_off" className="text-[26px]" />
    </div>
    <div className="flex flex-col gap-1.5">
      <p className="font-code-inline text-code-inline text-ink-tertiary">{copy.code}</p>
      <h1 className="text-headline-sm font-headline-sm font-semibold text-ink">{copy.title}</h1>
      <p className="text-body-sm font-body-sm text-ink-subtle">{copy.description}</p>
    </div>
    <Link
      to={homePath}
      className="rounded-lg bg-primary-container px-space-md py-2 font-label-md text-label-md font-semibold text-on-primary transition-colors hover:bg-primary-hover"
    >
      {copy.home}
    </Link>
  </div>
);
