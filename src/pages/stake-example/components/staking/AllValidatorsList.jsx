import React, { useMemo } from 'react';
import { getCoin } from '@/config';
import { shiftDigits } from '@/utils';
import {
  Text,
  Button,
  ValidatorList,
  ValidatorNameCell,
  ValidatorTokenAmountCell,
  GridColumn,
} from '@interchain-ui/react';

const AllValidatorsList = ({
  validators,
  openModal,
  chainName,
  logos,
  setSelectedValidator,
}) => {
  const coin = getCoin(chainName);

  const columns = useMemo(() => {
    const _columns = [
      {
        id: 'validator',
        label: 'Validator',
        width: '196px',
        align: 'left',
        render: (validator) => (
          <ValidatorNameCell
            validatorName={validator.name}
            validatorImg={logos[validator.address]}
          />
        ),
      },
      {
        id: 'voting-power',
        label: 'Voting Power',
        width: '196px',
        align: 'right',
        render: (validator) => (
          <ValidatorTokenAmountCell
            amount={validator.votingPower}
            symbol={coin.symbol}
          />
        ),
      },
      {
        id: 'commission',
        label: 'Commission',
        width: '196px',
        align: 'right',
        render: (validator) => (
          <Text fontWeight="$semibold">
            {shiftDigits(validator.commission, 2)}%
          </Text>
        ),
      },
      {
        id: 'action',
        width: '196px',
        align: 'right',
        render: (validator) => (
          <Button
            variant="solid"
            intent="secondary"
            size="sm"
            onClick={() => {
              openModal();
              setSelectedValidator(validator);
            }}
          >
            Manage
          </Button>
        ),
      },
    ];

    const hasApr = !!validators[0]?.apr;

    if (hasApr) {
      _columns.splice(3, 0, {
        id: 'apr',
        label: 'APR',
        width: '196px',
        align: 'right',
        render: (validator) => (
          <Text fontWeight="$semibold">{validator.apr}%</Text>
        ),
      });
    }

    return _columns;
  }, [validators, coin, logos, openModal, setSelectedValidator]);

  return (
    <ValidatorList
      columns={columns}
      data={validators}
      tableProps={{
        width: '100%',
      }}
      variant="ghost"
    />
  );
};

export default React.memo(AllValidatorsList);
