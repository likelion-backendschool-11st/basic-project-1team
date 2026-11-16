import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Icon } from './layout/Icon';

const copy = {
  title: '화면을 표시하는 중 문제가 발생했습니다',
  description:
    '잠시 후 다시 시도해 주세요. 문제가 계속되면 새로고침하거나 처음 화면으로 이동해 주세요.',
  reload: '새로고침',
  home: '처음 화면으로',
};

export interface ErrorBoundaryProps {
  /** 처음 화면 주소. 화면 상태를 모두 비우도록 전체 페이지 이동으로 간다 */
  readonly homeHref: string;
  /** 이 값이 바뀌면 오류 화면을 닫고 다시 그린다 (예: 경로) */
  readonly resetKey?: string;
  readonly children: ReactNode;
}

interface ErrorBoundaryState {
  readonly hasError: boolean;
}

/**
 * 화면을 그리다 난 오류를 잡아 흰 화면 대신 안내를 보여 준다.
 * React 의 오류 경계는 class 로만 만들 수 있어 React.FC 규칙의 예외다. (CODE_CONVENTION 8장)
 * API 오류는 각 hook 이 잡아 화면에 보여 주므로 여기까지 오지 않는다.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // eslint-disable-next-line no-console -- 원인을 찾을 수 있게 브라우저 콘솔에 남긴다
    console.error(error, info.componentStack);
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    if (this.state.hasError && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ hasError: false });
    }
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div
        role="alert"
        className="mx-auto flex max-w-[480px] flex-col items-center gap-space-md px-margin py-24 text-center"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-semantic-danger/15 text-semantic-danger">
          <Icon name="error" className="text-[26px]" />
        </div>
        <div className="flex flex-col gap-1.5">
          <h1 className="text-headline-sm font-headline-sm font-semibold text-ink">{copy.title}</h1>
          <p className="text-body-sm font-body-sm text-ink-subtle">{copy.description}</p>
        </div>
        <div className="flex gap-space-xs pt-space-xs">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="rounded-lg border border-hairline bg-surface-2 px-space-md py-2 font-label-md text-label-md text-ink transition-colors hover:bg-surface-3"
          >
            {copy.reload}
          </button>
          <a
            href={this.props.homeHref}
            className="rounded-lg bg-primary-container px-space-md py-2 font-label-md text-label-md font-semibold text-on-primary transition-colors hover:bg-primary-hover"
          >
            {copy.home}
          </a>
        </div>
      </div>
    );
  }
}
