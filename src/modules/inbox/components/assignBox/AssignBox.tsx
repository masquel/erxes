import { FilterableList } from "modules/common/components";
import { __ } from "modules/common/utils";
import Alert from "modules/common/utils/Alert";
import * as React from "react";
import { IUser } from "../../../auth/types";
import { IConversation } from "../../types";

type Props = {
  targets: IConversation[];
  event?: string;
  className?: string;
  afterSave?: () => void;
  // from containers
  assignees: IUser[];
  assign: (
    doc: { conversationIds: string[]; assignedUserId: string },
    callback: (error: any) => void
  ) => void;
  clear: (userIds: string[], callback: (error: any) => void) => void;
};

type State = {
  assigneesForList?: IUser[];
};

class AssignBox extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      assigneesForList: this.generateAssignParams(
        props.assignees,
        props.targets
      )
    };

    this.removeAssignee = this.removeAssignee.bind(this);
    this.assign = this.assign.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      assigneesForList: this.generateAssignParams(
        nextProps.assignees,
        nextProps.targets
      )
    });
  }

  generateAssignParams(assignees: IUser[] = [], targets: IConversation[] = []) {
    return assignees.map(assignee => {
      const count = targets.reduce((memo, target) => {
        let index = 0;

        if (
          target.assignedUserId &&
          target.assignedUserId.indexOf(assignee._id) > -1
        ) {
          index += 1;
        }

        return memo + index;
      }, 0);

      let state = "none";
      if (count === targets.length) {
        state = "all";
      } else if (count < targets.length && count > 0) {
        state = "some";
      }

      return {
        _id: assignee._id,
        title: assignee.details.fullName || assignee.email,
        avatar: assignee.details.avatar || "/images/avatar-colored.svg",
        selectedBy: state
      };
    });
  }

  assign(id: string) {
    const { assign, targets, afterSave } = this.props;

    assign(
      {
        conversationIds: targets.map(t => t._id),
        assignedUserId: id
      },
      error => {
        if (error) {
          Alert.error(error.reason);
        }
      }
    );

    if (afterSave) {
      afterSave();
    }
  }

  removeAssignee() {
    const { clear, targets } = this.props;
    clear(targets.map(t => t._id), error => {
      if (error) {
        Alert.error(`Error: ${error.reason}`);
      }
    });
  }

  render() {
    const { event, className } = this.props;

    const links = [
      {
        title: __("Remove assignee"),
        href: "#",
        onClick: this.removeAssignee
      }
    ];

    const props = {
      className,
      links,
      selectable: true,
      items: this.state.assigneesForList,
      [event]: this.assign
    };

    return <FilterableList {...props} />;
  }
}

export default AssignBox;