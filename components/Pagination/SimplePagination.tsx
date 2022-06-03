import classnames from 'classnames';
import * as React from 'react';

export interface SimplePaginationProps {
    page: number;
    limit: number;
    nextPageExists: boolean;
    mainBlockClassName?: string;
    handleClickNextButton: (value: number) => void;
    handleClickPrevButton: (value: number) => void;
    total: number;
    shouldRenderTotal: boolean;
    prefixedTextLabel?: string;
    separatorText?: string;
    totalSeparatorText?: string;
    resultsText?: string;
    totalValue?: number;
    previousButtonLabel?: string;
    nextButtonLabel?: string;
    textLabelClassName?: string;
    buttonsAdditionalClassName?: string;
}

export const SimplePagination: React.FC<SimplePaginationProps> = ({
    page,
    limit,
    nextPageExists,
    mainBlockClassName,
    handleClickNextButton,
    handleClickPrevButton,
    total,
    shouldRenderTotal,
    prefixedTextLabel,
    separatorText,
    totalSeparatorText,
    resultsText,
    totalValue,
    previousButtonLabel,
    nextButtonLabel,
    textLabelClassName,
    buttonsAdditionalClassName,
}) => {
    const fromValue = React.useMemo(() => {
        return (page - 1) * limit + 1;
    }, [page, limit]);

    const toValue = React.useMemo(() => {
        return (page - 1) * limit + total;
    }, [page, limit, total]);

    const renderFromToNode = React.useMemo(() => {
        return (
            <>
                {prefixedTextLabel} <span className="simple-pagination-font-medium">{fromValue}</span> {separatorText} <span className="simple-pagination-font-medium">{toValue}</span>
            </>
        );
    }, [prefixedTextLabel, fromValue, separatorText, toValue]);

    const renderOfTotal = React.useMemo(() => {
        if (shouldRenderTotal) {
            return (
                <>
                    {totalSeparatorText} <span className="simple-pagination-font-medium">{totalValue}</span> {resultsText}
                </>
            );
        }

        return null
    }, [shouldRenderTotal, totalValue, totalSeparatorText, resultsText]);

    const renderPreviousButton = React.useMemo(() => {
        return (
            <button
                className={classnames("simple-pagination-prev-button", buttonsAdditionalClassName)}
                onClick={() => handleClickPrevButton(page)}
                disabled={page === 1}
            >
                {previousButtonLabel}
            </button>
        );
    }, [page, previousButtonLabel]);

    const renderNextButton = React.useMemo(() => {
        return (
            <button
                className={classnames("simple-pagination-next-button", buttonsAdditionalClassName)}
                onClick={() => handleClickNextButton(page)}
                disabled={!nextPageExists}
            >
                {nextButtonLabel}
            </button>
        );
    }, [page, nextPageExists, nextButtonLabel]);

    return (
        <nav className={mainBlockClassName} aria-label="Pagination">
            <div className="simple-pagination-left">
                <p className={textLabelClassName}>
                    {renderFromToNode} {renderOfTotal}
                </p>
            </div>
            <div className="simple-pagination-right">
                {renderPreviousButton}
                {renderNextButton}
            </div>
        </nav>
    );
};

SimplePagination.defaultProps = {
    page: 1,
    limit: 10,
    nextPageExists: true,
    mainBlockClassName: 'simple-pagination',
    total: 10,
    shouldRenderTotal: true,
    prefixedTextLabel: 'Showing',
    separatorText: 'to',
    totalSeparatorText: 'of',
    resultsText: 'results',
    previousButtonLabel: 'Previous',
    nextButtonLabel: 'Next',
    textLabelClassName: 'simple-pagination-label',
    buttonsAdditionalClassName: 'text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 border-gray-300',
};
